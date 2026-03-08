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
      const data = await fetchArtworks();
      setArtworks(data);
      try {
        const limit = await checkDailyLimit();
        setDailyUsed(limit.used);
        setDailyAllowed(limit.allowed);
      } catch {
        // enhance_logs 컬렉션이 없거나 권한 부족 시 기본값 유지
      }
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
            오늘 사용: <strong>{dailyUsed}/{process.env.NEXT_PUBLIC_ENHANCE_DAILY_LIMIT || '1'}</strong>회
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

        {/* Artwork Grid */}
        {fetching ? (
          <p className="text-muted text-center py-20">작품을 불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="border border-border p-2 space-y-2"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <Image
                    src={artwork.useEnhanced && artwork.enhancedImage ? artwork.enhancedImage : artwork.image}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                  />
                  {artwork.enhancedImage && (
                    <span className="absolute top-1 right-1 text-[10px] px-1 py-0.5 bg-green-500 text-white">
                      보정
                    </span>
                  )}
                </div>
                <p className="text-xs truncate font-medium">{artwork.title}</p>
                <div className="space-y-1">
                  {artwork.enhancedImage ? (
                    <>
                      <button
                        onClick={() => handleToggleEnhanced(artwork)}
                        className="w-full py-1 text-[11px] border border-border hover:border-text transition-colors"
                      >
                        {artwork.useEnhanced ? '원본 사용' : '보정 사용'}
                      </button>
                      <button
                        onClick={() => handleEnhance(artwork)}
                        disabled={!dailyAllowed || status !== 'idle'}
                        className="w-full py-1 text-[11px] border border-border text-muted hover:border-text hover:text-text transition-colors disabled:opacity-50"
                      >
                        다시 보정
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEnhance(artwork)}
                      disabled={!dailyAllowed || status !== 'idle'}
                      className="w-full py-1 text-[11px] border border-border hover:border-text transition-colors disabled:opacity-50"
                    >
                      보정하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted mt-6 text-center">
          총 {artworks.length}점 · 보정 완료 {artworks.filter((a) => a.enhancedImage).length}점
        </p>
      </main>
    </AdminShell>
  );
}
