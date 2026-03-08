'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { artist } from '@/data/artist';
import { useI18n } from '@/lib/i18n';

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { t, locale, toggleLocale } = useI18n();

  const navItems = [
    { href: '/gallery', label: t.gallery },
    { href: '/about', label: t.about },
    { href: '/contact', label: t.contact },
  ];

  const isActive = (href: string) => {
    if (href === '/gallery') {
      return pathname === '/gallery' || pathname.startsWith('/works/');
    }
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl tracking-wide hover:opacity-70 transition-opacity"
        >
          {artist.name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm tracking-wider transition-opacity hover:opacity-70 ${
                isActive(href)
                  ? 'opacity-100 font-medium'
                  : 'opacity-60'
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={toggleLocale}
            className="text-xs tracking-wider opacity-50 hover:opacity-100 transition-opacity border border-border px-2 py-1"
          >
            {locale === 'ko' ? 'EN' : '한국어'}
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 -mr-2"
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isOpen}
        >
          <div className="w-5 flex flex-col gap-1">
            <span
              className={`block h-px bg-current transition-transform duration-300 ${
                isOpen ? 'rotate-45 translate-y-[5px]' : ''
              }`}
            />
            <span
              className={`block h-px bg-current transition-opacity duration-300 ${
                isOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-px bg-current transition-transform duration-300 ${
                isOpen ? '-rotate-45 -translate-y-[5px]' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile nav */}
      <nav
        aria-hidden={!isOpen}
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-bg ${
          isOpen ? 'max-h-80 opacity-100 border-t border-border' : 'max-h-0 opacity-0'
        }`}
      >
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setIsOpen(false)}
            className={`block px-6 py-4 text-sm tracking-wider border-b border-border transition-colors hover:bg-card-hover ${
              isActive(href) ? 'font-medium' : 'opacity-60'
            }`}
          >
            {label}
          </Link>
        ))}
        <button
          onClick={() => { toggleLocale(); setIsOpen(false); }}
          className="block w-full text-left px-6 py-4 text-sm tracking-wider border-b border-border transition-colors hover:bg-card-hover opacity-60"
        >
          {locale === 'ko' ? 'English' : '한국어'}
        </button>
      </nav>
    </header>
  );
}
