'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useArtworks } from '@/lib/use-artworks';
import { getDisplayImage } from '@/lib/types';
import { artist } from '@/data/artist';
import { useI18n } from '@/lib/i18n';

export default function Home() {
  const { artworks, featured } = useArtworks();
  const { t } = useI18n();
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
              {t.heroTitle.split('\n').map((line, i) => (
                <span key={i}>{line}{i < t.heroTitle.split('\n').length - 1 && <br />}</span>
              ))}
            </h1>
            <p className="text-base text-muted leading-relaxed mb-8 max-w-md">
              {t.heroSub}
              <br />
              {artist.name}{t.heroSubSuffix}
            </p>
            <Link
              href="/gallery"
              className="inline-block px-8 py-3 border border-text text-sm tracking-wider hover:bg-text hover:text-bg transition-colors"
            >
              {t.viewWorks}
            </Link>
          </div>
          <div className="fade-in delay-200">
            <Link href={`/works/${hero.id}`}>
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={getDisplayImage(hero)}
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
          <h2 className="font-serif text-xl">{t.featuredWorks}</h2>
          <Link
            href="/gallery"
            className="text-sm py-2 text-muted tracking-wider hover:text-text transition-colors"
          >
            {t.viewAll} &rarr;
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
                  src={getDisplayImage(artwork)}
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
            {t.artistStatement} &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
