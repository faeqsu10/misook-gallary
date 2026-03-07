'use client';

import Link from 'next/link';

import { useParams } from 'next/navigation';
import { useArtwork } from '@/lib/use-artworks';
import { STATUS_LABELS, CATEGORY_LABELS } from '@/lib/types';
import ArtworkViewer from '@/components/ArtworkViewer';

export default function WorkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { artwork, prev, next, loading } = useArtwork(id);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-[1fr_380px] gap-12 md:gap-16">
          <div className="aspect-[3/4] bg-gradient-to-r from-border via-card-hover to-border bg-[length:200%_100%] animate-shimmer" />
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
        <h1 className="font-serif text-2xl mb-4">작품을 찾을 수 없습니다</h1>
        <Link href="/gallery" className="text-sm text-muted hover:text-text transition-colors">
          갤러리로 돌아가기
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <Link
        href="/gallery"
        className="inline-block text-sm py-2 text-muted tracking-wider hover:text-text transition-colors mb-8"
      >
        &larr; 갤러리
      </Link>
      <div className="grid md:grid-cols-[1fr_380px] gap-12 md:gap-16">
        {/* Image */}
        <div className="fade-in">
          <ArtworkViewer src={artwork.image} alt={artwork.title} />
        </div>

        {/* Info */}
        <div className="fade-in-up delay-200">
          <h1 className="font-serif text-2xl md:text-3xl mb-2">
            {artwork.title}
          </h1>
          {artwork.titleEn && (
            <p className="text-sm text-muted mb-6">
              {artwork.titleEn}
            </p>
          )}

          <div className="space-y-3 text-sm border-t border-border pt-6">
            {artwork.year && (
              <div className="flex justify-between">
                <span className="text-muted">제작연도</span>
                <span>{artwork.year}</span>
              </div>
            )}
            {artwork.medium && (
              <div className="flex justify-between">
                <span className="text-muted">재료</span>
                <span>{artwork.medium}</span>
              </div>
            )}
            {artwork.dimensions && (
              <div className="flex justify-between">
                <span className="text-muted">크기</span>
                <span>{artwork.dimensions}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">분류</span>
              <span>{CATEGORY_LABELS[artwork.category]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">상태</span>
              <span>{STATUS_LABELS[artwork.status]}</span>
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
              문의하기
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
