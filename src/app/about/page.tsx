import type { Metadata } from 'next';
import Link from 'next/link';
import { artist } from '@/data/artist';

export const metadata: Metadata = {
  title: '작가 소개',
  description: artist.bio.slice(0, 160),
};

export default function AboutPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      {/* Hero Quote */}
      <div className="mb-20 py-12 text-center fade-in-up">
        <p className="font-serif text-2xl md:text-3xl lg:text-4xl leading-snug tracking-tight text-text/90 italic">
          &ldquo;나의 그림은 직선과 곡선, 형태와 색의 대화입니다.&rdquo;
        </p>
        <p className="mt-6 text-xs text-muted tracking-widest uppercase">
          {artist.name} &mdash; 작업 노트에서
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center mb-20 fade-in-up">
        <span className="block w-16 h-px bg-border" />
      </div>

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

      {/* History with Timeline */}
      <div className="border-t border-border pt-12 fade-in-up delay-300">
        <h2 className="font-serif text-lg mb-8">연보</h2>
        <div className="relative ml-3">
          {/* Vertical timeline line */}
          <div className="absolute left-0 top-1 bottom-1 w-px bg-border" />

          <div className="space-y-6">
            {artist.history.map(({ year, content }) => (
              <div key={year} className="relative flex gap-8 text-sm pl-6">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 -translate-x-1/2 w-2 h-2 rounded-full bg-muted" />
                <span className="text-muted shrink-0 w-28">
                  {year}
                </span>
                <span>{content}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mt-20 pt-12 border-t border-border text-center fade-in-up delay-300">
        <p className="text-sm text-muted mb-3">
          작품에 대해 궁금하신 점이 있으시면
        </p>
        <Link
          href="/contact"
          className="inline-block font-serif text-sm tracking-wider border-b border-muted pb-0.5 hover:border-foreground transition-colors"
        >
          문의하기
        </Link>
      </div>
    </section>
  );
}
