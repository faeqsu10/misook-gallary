'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-32 md:py-48 text-center">
      <p className="text-sm text-muted tracking-widest mb-6">오류가 발생했습니다</p>
      <h1 className="font-serif text-2xl md:text-3xl mb-4">
        페이지를 불러오지 못했습니다
      </h1>
      <p className="text-sm text-muted mb-12 max-w-sm mx-auto leading-relaxed">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도하거나 갤러리로 돌아가 주세요.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="px-8 py-3 border border-text text-sm tracking-wider hover:bg-text hover:text-bg transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/gallery"
          className="px-8 py-3 border border-border text-sm tracking-wider hover:border-text transition-colors"
        >
          갤러리로 돌아가기
        </Link>
      </div>
    </section>
  );
}
