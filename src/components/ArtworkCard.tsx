import Image from 'next/image';
import Link from 'next/link';
import { Artwork, STATUS_LABELS } from '@/lib/types';

export default function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <Link
      href={`/works/${artwork.id}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-border">
        <Image
          src={artwork.useEnhanced && artwork.enhancedImage ? artwork.enhancedImage : artwork.image}
          alt={artwork.title}
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
            <span>{STATUS_LABELS[artwork.status]}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
