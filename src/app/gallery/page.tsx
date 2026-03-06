'use client';

import { useState } from 'react';
import { CategoryFilter, StatusFilter } from '@/lib/types';
import { useArtworks } from '@/lib/use-artworks';
import ArtworkCard from '@/components/ArtworkCard';
import FilterBar from '@/components/FilterBar';
import { SkeletonGrid } from '@/components/Skeleton';

export default function GalleryPage() {
  const { artworks, loading } = useArtworks();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const filtered = artworks.filter((a) => {
    if (category !== 'all' && a.category !== category) return false;
    if (status !== 'all' && a.status !== status) return false;
    return true;
  });

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl md:text-3xl mb-2">Gallery</h1>
      <p className="text-sm text-muted mb-10">
        {category === 'all' && status === 'all'
          ? `${artworks.length}점의 작품을 감상하세요.`
          : `${filtered.length}점의 작품이 선택되었습니다.`}
      </p>

      <FilterBar
        category={category}
        status={status}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
      />

      {loading ? (
        <SkeletonGrid count={6} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted py-20">
          해당 조건의 작품이 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
          {filtered.map((artwork, i) => (
            <div
              key={artwork.id}
              className="fade-in-up"
              style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
            >
              <ArtworkCard artwork={artwork} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
