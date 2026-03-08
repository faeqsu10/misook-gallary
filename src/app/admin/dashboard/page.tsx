'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { fetchArtworks, deleteArtwork, updateArtwork } from '@/lib/artworks-db';
import { Artwork, getDisplayImage } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { artist } from '@/data/artist';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadArtworks();
    }
  }, [user]);

  async function loadArtworks() {
    setFetching(true);
    try {
      const data = await fetchArtworks();
      setArtworks(data);
    } catch (err) {
      console.error('Failed to fetch artworks:', err);
    } finally {
      setFetching(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 작품을 삭제하시겠습니까?`)) return;
    setDeleting(id);
    try {
      await deleteArtwork(id);
      setArtworks((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  }

  async function handleSwapOrder(indexA: number, indexB: number) {
    const a = artworks[indexA];
    const b = artworks[indexB];
    if (!a || !b) return;
    try {
      await Promise.all([
        updateArtwork(a.id, { order: b.order }),
        updateArtwork(b.id, { order: a.order }),
      ]);
      const updated = [...artworks];
      updated[indexA] = { ...a, order: b.order };
      updated[indexB] = { ...b, order: a.order };
      updated.sort((x, y) => x.order - y.order);
      setArtworks(updated);
    } catch {
      alert('순서 변경에 실패했습니다.');
    }
  }

  async function handleLogout() {
    await signOut(auth);
    document.cookie = '__session=; path=/; max-age=0';
    router.push('/admin');
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif text-xl tracking-wide hover:opacity-70 transition-opacity">
              {artist.name}
            </Link>
            <span className="text-xs text-muted border border-border px-2 py-0.5">관리자</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-muted hover:text-text transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl">작품 관리</h1>
          <Link
            href="/admin/upload"
            className="px-6 py-2.5 bg-text text-bg text-sm tracking-wider hover:opacity-90 transition-opacity"
          >
            새 작품 등록
          </Link>
        </div>

        {fetching ? (
          <p className="text-muted text-center py-20">작품을 불러오는 중...</p>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted mb-4">등록된 작품이 없습니다.</p>
            <Link
              href="/admin/upload"
              className="text-sm underline underline-offset-4 hover:opacity-70"
            >
              첫 작품을 등록해보세요
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {artworks.map((artwork, idx) => (
              <div
                key={artwork.id}
                className="border border-border p-2 space-y-2 hover:bg-card-hover transition-colors"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <Image
                    src={getDisplayImage(artwork)}
                    alt={artwork.altText || artwork.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                  />
                  <span className="absolute top-1 left-1 text-[10px] px-1 py-0.5 bg-black/50 text-white">
                    {artwork.order}
                  </span>
                  <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                    <button
                      onClick={() => handleSwapOrder(idx, idx - 1)}
                      disabled={idx === 0}
                      className="w-5 h-5 flex items-center justify-center bg-black/50 text-white text-[10px] hover:bg-black/80 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleSwapOrder(idx, idx + 1)}
                      disabled={idx === artworks.length - 1}
                      className="w-5 h-5 flex items-center justify-center bg-black/50 text-white text-[10px] hover:bg-black/80 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                </div>
                <p className="text-xs truncate font-medium">{artwork.title}</p>
                <p className="text-[10px] text-muted truncate">
                  {artwork.category}{artwork.year && ` · ${artwork.year}`}
                </p>
                <div className="flex gap-1">
                  <Link
                    href={`/admin/edit/${artwork.id}`}
                    className="flex-1 py-1 text-center text-[11px] border border-border hover:border-text transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(artwork.id, artwork.title)}
                    disabled={deleting === artwork.id}
                    className="flex-1 py-1 text-[11px] border border-border text-red-500 hover:border-red-500 transition-colors disabled:opacity-50"
                  >
                    {deleting === artwork.id ? '...' : '삭제'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted mt-8 text-center">
          총 {artworks.length}점의 작품
        </p>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 justify-center">
          <Link
            href="/admin/inquiries"
            className="px-5 py-2 text-xs border border-border hover:border-text transition-colors tracking-wider"
          >
            문의 관리
          </Link>
          <Link
            href="/admin/enhance"
            className="px-5 py-2 text-xs border border-border hover:border-text transition-colors tracking-wider"
          >
            AI 보정
          </Link>
          <Link
            href="/admin/seed"
            className="px-5 py-2 text-xs border border-border hover:border-text transition-colors tracking-wider"
          >
            초기 데이터
          </Link>
          <Link
            href="/"
            className="px-5 py-2 text-xs border border-border hover:border-text transition-colors tracking-wider"
            target="_blank"
          >
            사이트 보기 ↗
          </Link>
        </div>
      </main>
    </div>
  );
}
