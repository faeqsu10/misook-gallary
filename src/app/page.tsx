'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useArtworks } from '@/lib/use-artworks';
import { artist } from '@/data/artist';

export default function Home() {
  const { artworks, featured } = useArtworks();
  const hero = artworks.find((a) => a.id === 'bold-circles-lines') || featured[0] || artworks[0];
  const preview = featured.filter((a) => a.id !== hero?.id).slice(0, 4);

  if (!hero) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-6">
            <div className="h-10 w-64 bg-border rounded animate-shimmer bg-gradient-to-r from-border via-card-hover to-border bg-[length:200%_100%]" />
            <div className="h-4 w-48 bg-border rounded" />
            <div className="h-4 w-40 bg-border rounded" />
          </div>
          <div className="aspect-[3/4] bg-gradient-to-r from-border via-card-hover to-border bg-[length:200%_100%] animate-shimmer" />
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="fade-in-up">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
              오래 품어온<br />
              선과 형태를<br />
              다시 세상에 놓습니다.
            </h1>
            <p className="text-base text-muted leading-relaxed mb-8 max-w-md">
              지금도 여전히, 그리고 다시, 그리는 사람.
              <br />
              {artist.name}의 작품 세계를 만나보세요.
            </p>
            <Link
              href="/gallery"
              className="inline-block px-8 py-3 border border-text text-sm tracking-wider hover:bg-text hover:text-bg transition-colors"
            >
              작품 보기
            </Link>
          </div>
          <div className="fade-in delay-200">
            <Link href={`/works/${hero.id}`}>
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={hero.image}
                  alt={hero.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              <p className="mt-3 font-serif text-sm text-muted">
                {hero.title}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-serif text-xl">주요 작품</h2>
          <Link
            href="/gallery"
            className="text-sm py-2 text-muted tracking-wider hover:text-text transition-colors"
          >
            전체 보기 &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {preview.map((artwork, i) => (
            <Link
              key={artwork.id}
              href={`/works/${artwork.id}`}
              className="group block fade-in-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-border">
                <Image
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 font-serif text-sm">{artwork.title}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Artist Statement */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="font-serif text-lg md:text-xl leading-relaxed text-muted italic">
            &ldquo;구조 안에서 자유를 찾고,
            <br />
            질서 위에 감정을 놓습니다.&rdquo;
          </blockquote>
          <Link
            href="/about"
            className="inline-block mt-8 py-2 text-sm text-muted tracking-wider hover:text-text transition-colors"
          >
            작가 소개 &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
