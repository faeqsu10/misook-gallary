'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Artwork, getDisplayImage } from '@/lib/types';

interface Props {
  artworks: Artwork[];
  startIndex?: number;
  onClose: () => void;
}

const AUTO_INTERVAL = 6000;

export default function Slideshow({ artworks, startIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const [playing, setPlaying] = useState(true);
  const [mounted, setMounted] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const artwork = artworks[index];

  useEffect(() => {
    setMounted(true);
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % artworks.length);
  }, [artworks.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + artworks.length) % artworks.length);
  }, [artworks.length]);

  // Auto-play
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(goNext, AUTO_INTERVAL);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, goNext]);

  // Keyboard + body lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') { goNext(); setPlaying(false); }
      if (e.key === 'ArrowLeft') { goPrev(); setPlaying(false); }
      if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); }
    };
    document.addEventListener('keydown', handleKeyDown);

    requestAnimationFrame(() => closeBtnRef.current?.focus());

    const trapFocus = (e: FocusEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeBtnRef.current?.focus();
      }
    };
    document.addEventListener('focusin', trapFocus);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', trapFocus);
    };
  }, [onClose, goNext, goPrev]);

  if (!mounted || !artwork) return null;

  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center fade-in-scale"
      role="dialog"
      aria-modal="true"
      aria-label="슬라이드쇼"
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
        <span className="text-white/50 text-sm">
          {index + 1} / {artworks.length}
        </span>
        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white text-2xl transition-colors"
          aria-label="닫기"
        >
          &times;
        </button>
      </div>

      {/* Image */}
      <div className="relative w-[85vw] h-[70vh]">
        <Image
          key={artwork.id}
          src={getDisplayImage(artwork)}
          alt={artwork.altText || artwork.title}
          fill
          sizes="85vw"
          className="object-contain"
          priority
        />
      </div>

      {/* Info */}
      <div className="text-center mt-6">
        <p className="text-white font-serif text-lg">{artwork.title}</p>
        {artwork.year && (
          <p className="text-white/50 text-sm mt-1">
            {artwork.year}{artwork.medium && ` · ${artwork.medium}`}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 flex items-center gap-6">
        <button
          onClick={() => { goPrev(); setPlaying(false); }}
          className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white text-xl transition-colors"
          aria-label="이전"
        >
          &#8249;
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white text-lg transition-colors"
          aria-label={playing ? '일시정지' : '재생'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <button
          onClick={() => { goNext(); setPlaying(false); }}
          className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white text-xl transition-colors"
          aria-label="다음"
        >
          &#8250;
        </button>
      </div>

      {/* Side arrows (desktop) */}
      <button
        onClick={() => { goPrev(); setPlaying(false); }}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center text-white/30 hover:text-white text-3xl transition-colors"
        aria-label="이전 작품"
      >
        &#8249;
      </button>
      <button
        onClick={() => { goNext(); setPlaying(false); }}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center text-white/30 hover:text-white text-3xl transition-colors"
        aria-label="다음 작품"
      >
        &#8250;
      </button>
    </div>,
    document.body
  );
}
