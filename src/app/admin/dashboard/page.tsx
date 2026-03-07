'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { fetchArtworks, deleteArtwork } from '@/lib/artworks-db';
import { Artwork } from '@/lib/types';
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
          <div className="space-y-3">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="flex items-center gap-4 p-4 border border-border hover:bg-card-hover transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 flex-shrink-0 bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{artwork.title}</h3>
                  <p className="text-xs text-muted">
                    {artwork.medium} · {artwork.category}
                    {artwork.year && ` · ${artwork.year}`}
                  </p>
                </div>

                {/* Order */}
                <span className="text-xs text-muted w-8 text-center">{artwork.order}</span>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/edit/${artwork.id}`}
                    className="px-3 py-1.5 text-xs border border-border hover:border-text transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(artwork.id, artwork.title)}
                    disabled={deleting === artwork.id}
                    className="px-3 py-1.5 text-xs border border-border text-red-500 hover:border-red-500 transition-colors disabled:opacity-50"
                  >
                    {deleting === artwork.id ? '삭제 중...' : '삭제'}
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
            사이트 보기 &nearr;
          </Link>
        </div>
      </main>
    </div>
  );
}
