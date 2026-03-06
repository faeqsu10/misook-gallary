'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ArtworkViewer({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

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

      {/* Fullscreen modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-label="작품 확대 뷰"
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white text-2xl z-10"
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
        </div>
      )}
    </>
  );
}
