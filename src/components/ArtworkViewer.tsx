'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ArtworkViewer({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);

    const prevFocus = document.activeElement as HTMLElement;
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
      prevFocus?.focus();
    };
  }, [isOpen]);

  const modal = isOpen && mounted
    ? createPortal(
        <div
          ref={modalRef}
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center cursor-zoom-out fade-in-scale"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="작품 확대 뷰"
        >
          <button
            ref={closeBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white text-3xl z-10 transition-colors"
            aria-label="닫기"
          >
            &times;
          </button>
          <div className="relative w-[90vw] h-[90vh]">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div
        className="relative w-full aspect-[3/4] bg-border cursor-zoom-in"
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="작품 확대 보기"
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-contain"
          priority
        />
      </div>
      {modal}
    </>
  );
}
