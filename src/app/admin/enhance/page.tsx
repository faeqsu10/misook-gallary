'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { fetchArtworks, uploadEnhancedImage, updateArtwork } from '@/lib/artworks-db';
import {
  checkDailyLimit,
  recordEnhancement,
  fetchImageAsBase64,
  callEnhanceApi,
  base64ToBlob,
} from '@/lib/enhance';
import { Artwork } from '@/lib/types';
import AdminShell from '@/components/AdminShell';
import Image from 'next/image';

type EnhanceStatus = 'idle' | 'loading' | 'enhancing' | 'comparing' | 'saving' | 'done' | 'error';

export default function EnhancePage() {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [status, setStatus] = useState<EnhanceStatus>('idle');
  const [error, setError] = useState('');
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [dailyAllowed, setDailyAllowed] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    setFetching(true);
    try {
      const [data, limit] = await Promise.all([fetchArtworks(), checkDailyLimit()]);
      setArtworks(data);
      setDailyUsed(limit.used);
      setDailyAllowed(limit.allowed);
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setFetching(false);
    }
  }

  async function handleEnhance(artwork: Artwork) {
    if (!dailyAllowed) {
      setError('오늘의 보정 횟수(1회)를 모두 사용했습니다.');
      return;
    }

    setSelected(artwork);
    setStatus('loading');
    setError('');
    setEnhancedPreview(null);

    try {
      // 1. Fetch original image as base64
      const { base64, mimeType } = await fetchImageAsBase64(artwork.image);

      // 2. Call Gemini API
      setStatus('enhancing');
      const result = await callEnhanceApi(base64, mimeType);

      // 3. Create preview
      const blob = base64ToBlob(result.imageBase64, result.mimeType);
      setEnhancedBlob(blob);
      setEnhancedPreview(URL.createObjectURL(blob));
      setStatus('comparing');
    } catch (err) {
      setError(err instanceof Error ? err.message : '보정에 실패했습니다.');
      setStatus('error');
    }
  }

  async function handleAccept() {
    if (!selected || !enhancedBlob) return;

    setStatus('saving');
    setError('');

    try {
      const ext = enhancedBlob.type === 'image/png' ? 'png' : 'jpg';
      const filename = `${selected.id}-enhanced-${Date.now()}.${ext}`;
      const enhancedUrl = await uploadEnhancedImage(enhancedBlob, filename);

      await updateArtwork(selected.id, {
        enhancedImage: enhancedUrl,
        useEnhanced: true,
        enhancedAt: new Date().toISOString(),
      });

      await recordEnhancement(selected.id);

      // Update local state
      setArtworks((prev) =>
        prev.map((a) =>
          a.id === selected.id
            ? { ...a, enhancedImage: enhancedUrl, useEnhanced: true, enhancedAt: new Date().toISOString() }
            : a
        )
      );
      setDailyUsed((prev) => prev + 1);
      setDailyAllowed(false);
      setStatus('done');
    } catch {
      setError('저장에 실패했습니다.');
      setStatus('error');
    }
  }

  function handleReject() {
    setSelected(null);
    setStatus('idle');
    setEnhancedPreview(null);
    setEnhancedBlob(null);
    setError('');
  }

  async function handleToggleEnhanced(artwork: Artwork) {
    try {
      await updateArtwork(artwork.id, { useEnhanced: !artwork.useEnhanced });
      setArtworks((prev) =>
        prev.map((a) =>
          a.id === artwork.id ? { ...a, useEnhanced: !a.useEnhanced } : a
        )
      );
    } catch {
      setError('변경에 실패했습니다.');
    }
  }

  return (
    <AdminShell title="AI 촬영 보정">
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Daily limit info */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-muted">
            오늘 사용: <strong>{dailyUsed}/1</strong>회
            {!dailyAllowed && ' (소진)'}
          </p>
          <p className="text-xs text-muted">
            Gemini API를 활용한 갤러리급 촬영 보정
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Comparison View */}
        {selected && (status === 'loading' || status === 'enhancing' || status === 'comparing' || status === 'saving' || status === 'done') && (
          <div className="mb-10 border border-border p-6 space-y-6">
            <h2 className="font-serif text-lg">&ldquo;{selected.title}&rdquo; 보정 결과</h2>

            {(status === 'loading' || status === 'enhancing') && (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-2 border-muted border-t-text rounded-full animate-spin mb-4" />
                <p className="text-sm text-muted">
                  {status === 'loading' ? '원본 이미지 준비 중...' : 'AI 보정 중... (30초~1분 소요)'}
                </p>
              </div>
            )}

            {(status === 'comparing' || status === 'saving' || status === 'done') && enhancedPreview && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-muted mb-2 text-center">원본</p>
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={selected.image}
                        alt="원본"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-2 text-center">AI 보정</p>
                    <div className="relative aspect-square bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={enhancedPreview}
                        alt="보정 결과"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center pt-4">
                  {status === 'comparing' && (
                    <>
                      <button
                        onClick={handleAccept}
                        className="px-8 py-3 bg-text text-bg text-sm tracking-wider hover:opacity-90 transition-opacity"
                      >
                        보정 이미지 사용
                      </button>
                      <button
                        onClick={handleReject}
                        className="px-8 py-3 border border-border text-sm tracking-wider hover:border-text transition-colors"
                      >
                        사용하지 않음
                      </button>
                    </>
                  )}
                  {status === 'saving' && (
                    <p className="text-sm text-muted">저장 중...</p>
                  )}
                  {status === 'done' && (
                    <div className="text-center">
                      <p className="text-sm text-green-600 mb-3">보정 이미지가 적용되었습니다.</p>
                      <button
                        onClick={handleReject}
                        className="px-6 py-2 border border-border text-xs hover:border-text transition-colors"
                      >
                        닫기
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Artwork List */}
        {fetching ? (
          <p className="text-muted text-center py-20">작품을 불러오는 중...</p>
        ) : (
          <div className="space-y-3">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="flex items-center gap-4 p-4 border border-border"
              >
                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 overflow-hidden relative">
                  <Image
                    src={artwork.useEnhanced && artwork.enhancedImage ? artwork.enhancedImage : artwork.image}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{artwork.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {artwork.enhancedImage ? (
                      <span className="text-xs text-green-600">보정 완료</span>
                    ) : (
                      <span className="text-xs text-muted">미보정</span>
                    )}
                    {artwork.useEnhanced && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200">
                        보정 사용 중
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {artwork.enhancedImage && (
                    <button
                      onClick={() => handleToggleEnhanced(artwork)}
                      className="px-3 py-1.5 text-xs border border-border hover:border-text transition-colors"
                    >
                      {artwork.useEnhanced ? '원본 사용' : '보정 사용'}
                    </button>
                  )}
                  {!artwork.enhancedImage && (
                    <button
                      onClick={() => handleEnhance(artwork)}
                      disabled={!dailyAllowed || status !== 'idle'}
                      className="px-3 py-1.5 text-xs border border-border hover:border-text transition-colors disabled:opacity-50"
                    >
                      보정하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted mt-8 text-center">
          총 {artworks.length}점 · 보정 완료 {artworks.filter((a) => a.enhancedImage).length}점
        </p>
      </main>
    </AdminShell>
  );
}
