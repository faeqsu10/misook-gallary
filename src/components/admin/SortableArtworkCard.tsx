'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import Link from 'next/link';
import { Artwork, getDisplayImage } from '@/lib/types';

interface Props {
  artwork: Artwork;
  onDelete: (id: string, title: string) => void;
  deleting: string | null;
}

export default function SortableArtworkCard({ artwork, onDelete, deleting }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: artwork.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-border p-2 space-y-2 hover:bg-card-hover transition-colors"
    >
      <div
        className="relative aspect-square bg-gray-100 overflow-hidden cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <Image
          src={getDisplayImage(artwork)}
          alt={artwork.altText || artwork.title}
          fill
          className="object-cover pointer-events-none"
          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
        />
        <span className="absolute top-1 left-1 text-[10px] px-1 py-0.5 bg-black/50 text-white">
          {artwork.order}
        </span>
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
          onClick={() => onDelete(artwork.id, artwork.title)}
          disabled={deleting === artwork.id}
          className="flex-1 py-1 text-[11px] border border-border text-red-500 hover:border-red-500 transition-colors disabled:opacity-50"
        >
          {deleting === artwork.id ? '...' : '삭제'}
        </button>
      </div>
    </div>
  );
}
