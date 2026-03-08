'use client';

import { useState } from 'react';
import { CategoryFilter, StatusFilter } from '@/lib/types';
import { useArtworks } from '@/lib/use-artworks';
import ArtworkCard from '@/components/ArtworkCard';
import FilterBar from '@/components/FilterBar';
import { SkeletonGrid } from '@/components/Skeleton';
import { useI18n } from '@/lib/i18n';

export default function GalleryPage() {
  const { artworks, loading } = useArtworks();
  const { t } = useI18n();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [visibleCount, setVisibleCount] = useState(12);

  const filtered = artworks.filter((a) => {
    if (category !== 'all' && a.category !== category) return false;
    if (status !== 'all' && a.status !== status) return false;
    return true;
  });

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl md:text-3xl mb-2">{t.galleryTitle}</h1>
      <p className="text-sm text-muted mb-10">
        {category === 'all' && status === 'all'
          ? t.galleryCount(artworks.length)
          : t.galleryFiltered(filtered.length)}
      </p>

      <FilterBar
        category={category}
        status={status}
        onCategoryChange={(v) => { setCategory(v); setVisibleCount(12); }}
        onStatusChange={(v) => { setStatus(v); setVisibleCount(12); }}
      />

      {loading ? (
        <SkeletonGrid count={6} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-muted py-20">
          {t.noResults}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
            {filtered.slice(0, visibleCount).map((artwork, i) => (
              <div
                key={artwork.id}
                className="fade-in-up"
                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
              >
                <ArtworkCard artwork={artwork} />
              </div>
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount((v) => v + 12)}
                className="px-8 py-3 border border-border text-sm tracking-wider hover:border-text transition-colors"
              >
                {t.loadMore(filtered.length - visibleCount)}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
