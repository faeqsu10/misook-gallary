import type { Metadata } from 'next';
import { artist } from '@/data/artist';

export const metadata: Metadata = {
  title: '작가 소개 — 정미숙',
  description: artist.bio.slice(0, 160),
};

export default function AboutPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      {/* Artist Name */}
      <div className="mb-16 fade-in-up">
        <h1 className="font-serif text-3xl md:text-4xl mb-2">
          {artist.name}
        </h1>
        <p className="text-sm text-muted tracking-wider">
          {artist.nameEn}
        </p>
      </div>

      {/* Bio */}
      <div className="mb-16 fade-in-up delay-100">
        <h2 className="font-serif text-lg mb-6">작가 소개</h2>
        {artist.bio.split('\n\n').map((paragraph, i) => (
          <p
            key={i}
            className="text-sm leading-relaxed text-muted mb-4"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Statement */}
      <div className="mb-16 border-t border-border pt-12 fade-in-up delay-200">
        <h2 className="font-serif text-lg mb-6">작업 노트</h2>
        <blockquote className="pl-6 border-l-2 border-border">
          {artist.statement.split('\n').map((line, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed text-muted italic mb-2"
            >
              {line}
            </p>
          ))}
        </blockquote>
      </div>

      {/* History */}
      <div className="border-t border-border pt-12 fade-in-up delay-300">
        <h2 className="font-serif text-lg mb-8">연보</h2>
        <div className="space-y-4">
          {artist.history.map(({ year, content }) => (
            <div key={year} className="flex gap-8 text-sm">
              <span className="text-muted shrink-0 w-28">
                {year}
              </span>
              <span>{content}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
