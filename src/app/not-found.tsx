import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-24 text-center">
      <h1 className="font-serif text-6xl md:text-8xl text-border mb-8">404</h1>
      <p className="font-serif text-xl mb-2">페이지를 찾을 수 없습니다</p>
      <p className="text-sm text-muted mb-10">
        찾으시는 작품이나 페이지가 이동되었거나 존재하지 않습니다.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/"
          className="px-8 py-3 border border-text text-sm tracking-wider hover:bg-text hover:text-bg transition-colors"
        >
          홈으로
        </Link>
        <Link
          href="/gallery"
          className="px-8 py-3 text-sm tracking-wider text-muted hover:text-text transition-colors"
        >
          갤러리 보기
        </Link>
      </div>
    </section>
  );
}
