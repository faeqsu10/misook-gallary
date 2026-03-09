'use client';

import Link from 'next/link';

import { useParams } from 'next/navigation';
import { useArtwork } from '@/lib/use-artworks';
import { getDisplayImage, getDisplayLabel } from '@/lib/types';
import { useState } from 'react';
import ArtworkViewer from '@/components/ArtworkViewer';
import ImageCompare from '@/components/ImageCompare';
import ShareButton from '@/components/ShareButton';
import { SITE_URL } from '@/lib/constants';
import { artist } from '@/data/artist';
import { useI18n } from '@/lib/i18n';

export default function WorkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { artwork, prev, next, loading } = useArtwork(id);
  const { t } = useI18n();
  const [compareMode, setCompareMode] = useState(false);


  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-[1fr_380px] gap-12 md:gap-16">
          <div className="aspect-[3/4] max-h-[75vh] bg-gradient-to-r from-border via-card-hover to-border bg-[length:200%_100%] animate-shimmer" />
          <div className="space-y-4">
            <div className="h-8 w-48 bg-border rounded" />
            <div className="h-4 w-32 bg-border rounded" />
            <div className="border-t border-border pt-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-16 bg-border rounded" />
                  <div className="h-4 w-24 bg-border rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!artwork) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="font-serif text-2xl mb-4">{t.artworkNotFound}</h1>
        <Link href="/gallery" className="text-sm text-muted hover:text-text transition-colors">
          {t.backToGallery}
        </Link>
      </section>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title,
    ...(artwork.titleEn && { alternateName: artwork.titleEn }),
    ...(artwork.description && { description: artwork.description }),
    ...(artwork.year && { dateCreated: artwork.year }),
    ...(artwork.medium && { artMedium: artwork.medium }),
    ...(artwork.dimensions && { size: artwork.dimensions }),
    image: artwork.image.startsWith('http')
      ? artwork.image
      : `${SITE_URL}${artwork.image}`,
    artist: {
      '@type': 'Person',
      name: artist.name,
    },
    url: `${SITE_URL}/works/${artwork.id}`,
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/gallery"
        className="inline-block text-sm py-2 text-muted tracking-wider hover:text-text transition-colors mb-8"
      >
        &larr; {t.backToGallery}
      </Link>
      <div className="grid md:grid-cols-[1fr_380px] gap-12 md:gap-16">
        {/* Image */}
        <div className="fade-in">
          {compareMode && artwork.enhancements ? (
            <ImageCompare
              originalSrc={artwork.image}
              enhancedSrc={getDisplayImage(artwork)}
              alt={artwork.title}
              originalLabel={t.originalLabel}
              enhancedLabel={t.enhancedLabel}
            />
          ) : (
            <ArtworkViewer
              src={getDisplayImage(artwork)}
              alt={artwork.title}
            />
          )}
          <div className="flex items-center justify-center gap-4 mt-2">
            {getDisplayLabel(artwork) && (
              <p className="text-xs text-muted">{getDisplayLabel(artwork)}</p>
            )}
            {artwork.enhancements && (artwork.enhancements.corrected || artwork.enhancements.artEnhanced) && (
              <button
                onClick={() => setCompareMode((v) => !v)}
                className="text-xs text-muted hover:text-text transition-colors underline underline-offset-4"
              >
                {compareMode ? t.normalView : t.compareView}
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="fade-in-up delay-200">
          <h1 className="font-serif text-2xl md:text-3xl mb-2">
            {artwork.title}
          </h1>
          {artwork.titleEn && (
            <p className="text-sm text-muted mb-4">
              {artwork.titleEn}
            </p>
          )}
          <div className="mb-6">
            <ShareButton
              title={artwork.title}
              url={`${SITE_URL}/works/${artwork.id}`}
            />
          </div>

          <div className="space-y-3 text-sm border-t border-border pt-6">
            {artwork.year && (
              <div className="flex justify-between">
                <span className="text-muted">{t.year}</span>
                <span>{artwork.year}</span>
              </div>
            )}
            {artwork.medium && (
              <div className="flex justify-between">
                <span className="text-muted">{t.medium}</span>
                <span>{artwork.medium}</span>
              </div>
            )}
            {artwork.dimensions && (
              <div className="flex justify-between">
                <span className="text-muted">{t.dimensions}</span>
                <span>{artwork.dimensions}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">{t.category}</span>
              <span>{t.categoryLabels[artwork.category] || artwork.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">{t.status}</span>
              <span>{t.statusLabels[artwork.status] || artwork.status}</span>
            </div>
          </div>

          {artwork.description && (
            <p className="mt-6 text-base leading-relaxed text-muted border-t border-border pt-6">
              {artwork.description}
            </p>
          )}

          {artwork.status === 'inquiry' && (
            <Link
              href={`/contact?artwork=${encodeURIComponent(artwork.title)}`}
              className="inline-block mt-8 px-8 py-3 border border-text text-sm tracking-wider hover:bg-text hover:text-bg transition-colors"
            >
              {t.contactInquiry}
            </Link>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-12 pt-6 border-t border-border">
            {prev ? (
              <Link
                href={`/works/${prev.id}`}
                className="text-sm py-2 inline-block text-muted hover:text-text transition-colors"
              >
                &larr; {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/works/${next.id}`}
                className="text-sm py-2 inline-block text-muted hover:text-text transition-colors"
              >
                {next.title} &rarr;
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
