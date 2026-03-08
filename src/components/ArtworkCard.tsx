'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Artwork, getDisplayImage } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

export default function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const { t } = useI18n();

  const statusLabels: Record<string, string> = {
    collection: t.collection,
    exhibit: t.exhibit,
    inquiry: t.inquiry,
  };

  return (
    <Link
      href={`/works/${artwork.id}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-border">
        <Image
          src={getDisplayImage(artwork)}
          alt={artwork.altText || artwork.title}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
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
            <span>{statusLabels[artwork.status]}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
