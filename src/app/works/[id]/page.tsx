import Link from 'next/link';
import { notFound } from 'next/navigation';
import { artworks, getArtwork, getAdjacentArtworks } from '@/data/artworks';
import { STATUS_LABELS, CATEGORY_LABELS } from '@/lib/types';
import ArtworkViewer from '@/components/ArtworkViewer';

export function generateStaticParams() {
  return artworks.map((artwork) => ({ id: artwork.id }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    const artwork = getArtwork(id);
    if (!artwork) return { title: '작품을 찾을 수 없습니다' };
    return {
      title: `${artwork.title} — 정미숙`,
      description: artwork.description || `정미숙 작가의 작품 "${artwork.title}"`,
    };
  });
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artwork = getArtwork(id);
  if (!artwork) notFound();

  const { prev, next } = getAdjacentArtworks(id);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
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
            <p className="mt-6 text-sm leading-relaxed text-muted border-t border-border pt-6">
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
                className="text-xs text-muted hover:text-text transition-colors"
              >
                &larr; {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/works/${next.id}`}
                className="text-xs text-muted hover:text-text transition-colors"
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
