export default function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="font-serif text-sm text-muted">
          이곳은 한 작가의 작업을 천천히 모아가는 공간입니다.
        </p>
        <p className="mt-4 text-xs text-muted opacity-60">
          &copy; {new Date().getFullYear()} 정미숙. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
