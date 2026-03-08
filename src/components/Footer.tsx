'use client';

import Link from 'next/link';
import { artist } from '@/data/artist';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-6 text-center relative">
        <p className="font-serif text-sm text-muted">
          {t.footerRights}
        </p>
        <p className="mt-4 text-xs text-muted opacity-60">
          &copy; {new Date().getFullYear()} {artist.name}. All rights reserved.
        </p>
        <Link
          href="/admin"
          className="absolute bottom-0 right-0 text-xs text-muted opacity-30 hover:opacity-60 transition-opacity"
        >
          관리자
        </Link>
      </div>
    </footer>
  );
}
