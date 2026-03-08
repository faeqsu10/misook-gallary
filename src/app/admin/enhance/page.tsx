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
import { Artwork, EnhanceTier, DisplayVersion, DISPLAY_VERSION_LABELS, getDisplayImage } from '@/lib/types';
import AdminShell from '@/components/AdminShell';
import Image from 'next/image';

type EnhanceStatus = 'idle' | 'loading' | 'enhancing' | 'comparing' | 'saving' | 'done' | 'error';

const TIER_LABELS: Record<EnhanceTier, string> = {
  corrected: '촬영 보정',
  artEnhanced: 'AI 감상 버전',
};

export default function EnhancePage() {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [activeTier, setActiveTier] = useState<EnhanceTier>('corrected');
  const [status, setStatus] = useState<EnhanceStatus>('idle');
  const [error, setError] = useState('');
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);

  // Separate daily limits per tier
  const [correctedUsed, setCorrectedUsed] = useState(0);
  const [correctedLimit, setCorrectedLimit] = useState(3);
  const [correctedAllowed, setCorrectedAllowed] = useState(true);
  const [artUsed, setArtUsed] = useState(0);
  const [artLimit, setArtLimit] = useState(1);
  const [artAllowed, setArtAllowed] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    setFetching(true);
    try {
      const data = await fetchArtworks();
      setArtworks(data);
      try {
        const [cLimit, aLimit] = await Promise.all([
          checkDailyLimit('corrected'),
          checkDailyLimit('artEnhanced'),
        ]);
        setCorrectedUsed(cLimit.used);
        setCorrectedLimit(cLimit.limit);
        setCorrectedAllowed(cLimit.allowed);
        setArtUsed(aLimit.used);
        setArtLimit(aLimit.limit);
        setArtAllowed(aLimit.allowed);
      } catch {
        // enhance_logs 컬렉션 없거나 권한 부족 시 기본값 유지
      }
    } catch {
      setError('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setFetching(false);
    }
  }

  function isTierAllowed(tier: EnhanceTier): boolean {
    return tier === 'corrected' ? correctedAllowed : artAllowed;
  }

  async function handleEnhance(artwork: Artwork, tier: EnhanceTier) {
    if (!isTierAllowed(tier)) {
      setError(`오늘의 ${TIER_LABELS[tier]} 횟수를 모두 사용했습니다.`);
      return;
    }

    // AI 감상 버전은 확인 다이얼로그
    if (tier === 'artEnhanced') {
      const ok = confirm(
        'AI가 이 작품에서 영감을 받아 새로운 버전을 만들어봅니다.\n원본 작품은 항상 보존됩니다.\n\n진행하시겠습니까?'
      );
      if (!ok) return;
    }

    setSelected(artwork);
    setActiveTier(tier);
    setStatus('loading');
    setError('');
    setEnhancedPreview(null);

    try {
      const { base64, mimeType } = await fetchImageAsBase64(artwork.image);
      setStatus('enhancing');
      const result = await callEnhanceApi(base64, mimeType, tier);
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
      const filename = `${selected.id}-${activeTier}-${Date.now()}.${ext}`;
      const enhancedUrl = await uploadEnhancedImage(enhancedBlob, filename, activeTier);

      const now = new Date().toISOString();
      const existingEnhancements = selected.enhancements || {};
      const newEnhancements = {
        ...existingEnhancements,
        [activeTier]: { imageUrl: enhancedUrl, createdAt: now },
      };

      // AI 감상 버전은 기본 비공개 (displayVersion 변경 안함)
      const updateData: Partial<Artwork> = {
        enhancements: newEnhancements,
        // Legacy compat
        ...(activeTier === 'corrected' && {
          enhancedImage: enhancedUrl,
          useEnhanced: true,
          enhancedAt: now,
        }),
      };

      // 촬영 보정은 자동 적용, AI 감상은 수동 선택
      if (activeTier === 'corrected' && (!selected.displayVersion || selected.displayVersion === 'original')) {
        updateData.displayVersion = 'corrected';
      }

      await updateArtwork(selected.id, updateData);
      await recordEnhancement(selected.id, activeTier);

      setArtworks((prev) =>
        prev.map((a) =>
          a.id === selected.id
            ? { ...a, ...updateData, enhancements: newEnhancements }
            : a
        )
      );

      if (activeTier === 'corrected') {
        setCorrectedUsed((p) => p + 1);
        setCorrectedAllowed(correctedUsed + 1 < correctedLimit);
      } else {
        setArtUsed((p) => p + 1);
        setArtAllowed(artUsed + 1 < artLimit);
      }

      setStatus('done');
    } catch {
      setError('저장에 실패했습니다.');
      setStatus('error');
    }
  }

  function handleReject() {
    if (enhancedPreview) URL.revokeObjectURL(enhancedPreview);
    setSelected(null);
    setStatus('idle');
    setEnhancedPreview(null);
    setEnhancedBlob(null);
    setError('');
  }

  async function handleSetDisplayVersion(artwork: Artwork, version: DisplayVersion) {
    try {
      const updateData: Partial<Artwork> = { displayVersion: version };
      // Legacy compat
      if (version === 'corrected') {
        updateData.useEnhanced = true;
      } else if (version === 'original') {
        updateData.useEnhanced = false;
      }

      await updateArtwork(artwork.id, updateData);
      setArtworks((prev) =>
        prev.map((a) =>
          a.id === artwork.id ? { ...a, ...updateData } : a
        )
      );
    } catch {
      setError('변경에 실패했습니다.');
    }
  }

  function getAvailableVersions(artwork: Artwork): DisplayVersion[] {
    const versions: DisplayVersion[] = ['original'];
    if (artwork.enhancements?.corrected || artwork.enhancedImage) versions.push('corrected');
    if (artwork.enhancements?.artEnhanced) versions.push('artEnhanced');
    return versions;
  }

  function getCurrentVersion(artwork: Artwork): DisplayVersion {
    if (artwork.displayVersion) return artwork.displayVersion;
    if (artwork.useEnhanced && artwork.enhancedImage) return 'corrected';
    return 'original';
  }

  function hasEnhancement(artwork: Artwork, tier: EnhanceTier): boolean {
    if (tier === 'corrected') return !!(artwork.enhancements?.corrected || artwork.enhancedImage);
    return !!artwork.enhancements?.artEnhanced;
  }

  return (
    <AdminShell title="AI 작품 보정">
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Daily limit info */}
        <div className="flex flex-wrap items-center gap-6 mb-8">
          <p className="text-sm text-muted">
            촬영 보정: <strong>{correctedUsed}/{correctedLimit}</strong>회
            {!correctedAllowed && ' (소진)'}
          </p>
          <p className="text-sm text-muted">
            AI 감상: <strong>{artUsed}/{artLimit}</strong>회
            {!artAllowed && ' (소진)'}
          </p>
          <p className="text-xs text-muted ml-auto">
            Gemini API 활용
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Comparison View */}
        {selected && status !== 'idle' && status !== 'error' && (
          <div className="mb-10 border border-border p-6 space-y-6">
            <h2 className="font-serif text-lg">
              &ldquo;{selected.title}&rdquo; — {TIER_LABELS[activeTier]}
            </h2>

            {(status === 'loading' || status === 'enhancing') && (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-2 border-muted border-t-text rounded-full animate-spin mb-4" />
                <p className="text-sm text-muted">
                  {status === 'loading' ? '원본 이미지 준비 중...' : `${TIER_LABELS[activeTier]} 중... (30초~1분 소요)`}
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
                    <p className="text-xs text-muted mb-2 text-center">{TIER_LABELS[activeTier]}</p>
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

                {activeTier === 'artEnhanced' && (
                  <p className="text-xs text-muted text-center italic">
                    AI가 작품에서 영감을 받아 만든 변주입니다. 원작은 보존됩니다.
                  </p>
                )}

                <div className="flex gap-4 justify-center pt-4">
                  {status === 'comparing' && (
                    <>
                      <button
                        onClick={handleAccept}
                        className="px-8 py-3 bg-text text-bg text-sm tracking-wider hover:opacity-90 transition-opacity"
                      >
                        {activeTier === 'corrected' ? '보정 이미지 사용' : '감상 버전 저장'}
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
                      <p className="text-sm text-green-600 mb-3">
                        {activeTier === 'corrected'
                          ? '보정 이미지가 적용되었습니다.'
                          : 'AI 감상 버전이 저장되었습니다. (공개 설정은 아래에서 선택)'}
                      </p>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {artworks.map((artwork) => {
              const versions = getAvailableVersions(artwork);
              const current = getCurrentVersion(artwork);
              const hasCorrected = hasEnhancement(artwork, 'corrected');
              const hasArt = hasEnhancement(artwork, 'artEnhanced');

              return (
                <div
                  key={artwork.id}
                  className="border border-border p-2 space-y-2"
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src={getDisplayImage(artwork)}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                    {/* Badges */}
                    <div className="absolute top-1 right-1 flex gap-0.5">
                      {hasCorrected && (
                        <span className="text-[9px] px-1 py-0.5 bg-blue-500 text-white">보정</span>
                      )}
                      {hasArt && (
                        <span className="text-[9px] px-1 py-0.5 bg-purple-500 text-white">감상</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs truncate font-medium">{artwork.title}</p>

                  {/* Display version selector */}
                  {versions.length > 1 && (
                    <div className="flex gap-0.5">
                      {versions.map((v) => (
                        <button
                          key={v}
                          onClick={() => handleSetDisplayVersion(artwork, v)}
                          className={`flex-1 py-0.5 text-[10px] border transition-colors ${
                            current === v
                              ? 'border-text bg-text text-bg'
                              : 'border-border hover:border-text'
                          }`}
                        >
                          {DISPLAY_VERSION_LABELS[v]}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEnhance(artwork, 'corrected')}
                      disabled={!correctedAllowed || status !== 'idle'}
                      className="flex-1 py-1 text-[10px] border border-border hover:border-blue-400 text-muted hover:text-blue-600 transition-colors disabled:opacity-40"
                    >
                      {hasCorrected ? '재보정' : '촬영 보정'}
                    </button>
                    <button
                      onClick={() => handleEnhance(artwork, 'artEnhanced')}
                      disabled={!artAllowed || status !== 'idle'}
                      className="flex-1 py-1 text-[10px] border border-border hover:border-purple-400 text-muted hover:text-purple-600 transition-colors disabled:opacity-40"
                    >
                      {hasArt ? '재감상' : 'AI 감상'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted mt-6 text-center">
          총 {artworks.length}점 · 촬영 보정 {artworks.filter((a) => hasEnhancement(a, 'corrected')).length}점 · AI 감상 {artworks.filter((a) => hasEnhancement(a, 'artEnhanced')).length}점
        </p>
      </main>
    </AdminShell>
  );
}
