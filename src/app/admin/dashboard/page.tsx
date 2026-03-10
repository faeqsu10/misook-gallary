'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { fetchArtworks, deleteArtwork, updateArtwork } from '@/lib/artworks-db';
import { Artwork } from '@/lib/types';
import Link from 'next/link';
import { artist } from '@/data/artist';
import { logger } from '@/lib/logger';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import SortableArtworkCard from '@/components/admin/SortableArtworkCard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

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
      logger.error('작품 목록 로드 실패', { action: 'artwork.fetch', source: 'admin', userId: user?.uid, userEmail: user?.email, error: err });
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
      logger.error('작품 삭제 실패', { action: 'artwork.delete', source: 'admin', userId: user?.uid, userEmail: user?.email, metadata: { artworkId: id }, error: err });
      alert('삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = artworks.findIndex((a) => a.id === active.id);
    const newIndex = artworks.findIndex((a) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder locally first for instant feedback
    const reordered = [...artworks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Assign new order values
    const oldArtworks = [...artworks];
    const updated = reordered.map((a, i) => ({ ...a, order: i + 1 }));
    setArtworks(updated);

    // Persist to Firestore
    setSaving(true);
    try {
      const updates = updated
        .filter((a) => a.order !== oldArtworks.find((o) => o.id === a.id)?.order)
        .map((a) => updateArtwork(a.id, { order: a.order }));
      await Promise.all(updates);
    } catch {
      alert('순서 저장에 실패했습니다. 새로고침해주세요.');
      loadArtworks();
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try { await signOut(auth); } catch { /* proceed anyway */ }
    await fetch('/api/auth/session', { method: 'DELETE' });
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
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl">작품 관리</h1>
            {saving && (
              <span className="text-xs text-muted animate-pulse">저장 중...</span>
            )}
          </div>
          <Link
            href="/admin/upload"
            className="px-6 py-2.5 bg-text text-bg text-sm tracking-wider hover:opacity-90 transition-opacity"
          >
            새 작품 등록
          </Link>
        </div>

        {!fetching && artworks.length > 0 && (
          <p className="text-xs text-muted mb-4">
            드래그하여 작품 순서를 변경할 수 있습니다.
          </p>
        )}

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={artworks.map((a) => a.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {artworks.map((artwork) => (
                  <SortableArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    onDelete={handleDelete}
                    deleting={deleting}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
            href="/admin/guestbook"
            className="px-5 py-2 text-xs border border-border hover:border-text transition-colors tracking-wider"
          >
            방명록 관리
          </Link>
          <Link
            href="/admin/logs"
            className="px-5 py-2 text-xs border border-border hover:border-text transition-colors tracking-wider"
          >
            로그
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
