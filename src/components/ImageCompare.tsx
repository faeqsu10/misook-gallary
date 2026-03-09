'use client';

import Image from 'next/image';
import { useRef, useState, useCallback } from 'react';

interface Props {
  originalSrc: string;
  enhancedSrc: string;
  alt: string;
  originalLabel?: string;
  enhancedLabel?: string;
}

export default function ImageCompare({
  originalSrc,
  enhancedSrc,
  alt,
  originalLabel = '원본',
  enhancedLabel = '보정',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    updatePosition(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    updatePosition(e.clientX);
  }, [dragging, updatePosition]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/4] max-h-[75vh] overflow-hidden cursor-col-resize select-none bg-border"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="slider"
      aria-label="이미지 비교 슬라이더"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Enhanced (full, behind) */}
      <Image
        src={enhancedSrc}
        alt={`${alt} - ${enhancedLabel}`}
        fill
        sizes="(max-width: 768px) 100vw, 60vw"
        className="object-contain"
      />

      {/* Original (clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={originalSrc}
          alt={`${alt} - ${originalLabel}`}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-contain"
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none z-10"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-xs text-gray-600">
          ⟷
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 text-[11px] px-2 py-0.5 bg-black/50 text-white rounded-sm z-10">
        {originalLabel}
      </span>
      <span className="absolute top-3 right-3 text-[11px] px-2 py-0.5 bg-black/50 text-white rounded-sm z-10">
        {enhancedLabel}
      </span>
    </div>
  );
}
