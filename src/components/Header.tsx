'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl tracking-wide hover:opacity-70 transition-opacity"
        >
          정미숙
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm tracking-wider transition-opacity hover:opacity-70 ${
                pathname === href
                  ? 'opacity-100 font-medium'
                  : 'opacity-60'
              }`}
            >
              {label}
            </Link>
          ))}
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
      {isOpen && (
        <nav className="md:hidden border-t border-border bg-bg">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`block px-6 py-4 text-sm tracking-wider border-b border-border transition-colors hover:bg-card-hover ${
                pathname === href ? 'font-medium' : 'opacity-60'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
