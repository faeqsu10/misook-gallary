'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Artwork, getDisplayImage } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

export default function ArtworkCard({ artwork, priority = false }: { artwork: Artwork; priority?: boolean }) {
  const { t } = useI18n();
  const [loaded, setLoaded] = useState(false);

  return (
    <Link href={`/works/${artwork.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-border">
        {!loaded && (
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]" />
        )}
        <Image
          src={getDisplayImage(artwork)}
          alt={artwork.altText || artwork.title}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ viewTransitionName: `artwork-${artwork.id}` }}
          priority={priority}
          onLoad={() => setLoaded(true)}
        />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-serif text-sm">{artwork.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted">
          {artwork.year && <span>{artwork.year}</span>}
          {artwork.year && artwork.status !== 'collection' && (
            <span className="opacity-40">·</span>
          )}
          {artwork.status !== 'collection' && (
            <span>{t.statusLabels[artwork.status]}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
