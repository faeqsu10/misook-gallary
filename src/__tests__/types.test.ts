import { describe, it, expect } from 'vitest';
import { getDisplayImage, getDisplayLabel, type Artwork } from '@/lib/types';

const baseArtwork: Artwork = {
  id: 'test-1',
  title: '테스트 작품',
  year: '2024',
  medium: '캔버스에 아크릴',
  dimensions: '50x60cm',
  category: 'abstract',
  status: 'exhibit',
  image: '/artworks/test.jpg',
  order: 1,
};

describe('getDisplayImage', () => {
  it('returns original image by default', () => {
    expect(getDisplayImage(baseArtwork)).toBe('/artworks/test.jpg');
  });

  it('returns corrected image when displayVersion is corrected', () => {
    const artwork: Artwork = {
      ...baseArtwork,
      displayVersion: 'corrected',
      enhancements: {
        corrected: { imageUrl: '/enhanced/corrected.jpg', createdAt: '2024-01-01' },
      },
    };
    expect(getDisplayImage(artwork)).toBe('/enhanced/corrected.jpg');
  });

  it('returns artEnhanced image when displayVersion is artEnhanced', () => {
    const artwork: Artwork = {
      ...baseArtwork,
      displayVersion: 'artEnhanced',
      enhancements: {
        artEnhanced: { imageUrl: '/enhanced/art.jpg', createdAt: '2024-01-01' },
      },
    };
    expect(getDisplayImage(artwork)).toBe('/enhanced/art.jpg');
  });

  it('falls back to original when enhancement is missing', () => {
    const artwork: Artwork = {
      ...baseArtwork,
      displayVersion: 'corrected',
    };
    expect(getDisplayImage(artwork)).toBe('/artworks/test.jpg');
  });

  it('supports legacy useEnhanced field', () => {
    const artwork: Artwork = {
      ...baseArtwork,
      useEnhanced: true,
      enhancedImage: '/legacy/enhanced.jpg',
    };
    expect(getDisplayImage(artwork)).toBe('/legacy/enhanced.jpg');
  });
});

describe('getDisplayLabel', () => {
  it('returns null for original', () => {
    expect(getDisplayLabel(baseArtwork)).toBeNull();
  });

  it('returns label for corrected', () => {
    const artwork: Artwork = { ...baseArtwork, displayVersion: 'corrected' };
    expect(getDisplayLabel(artwork)).toBe('촬영 보정 이미지');
  });

  it('returns label for artEnhanced', () => {
    const artwork: Artwork = { ...baseArtwork, displayVersion: 'artEnhanced' };
    expect(getDisplayLabel(artwork)).toBe('AI 감상 버전');
  });

  it('returns corrected label for legacy useEnhanced', () => {
    const artwork: Artwork = { ...baseArtwork, useEnhanced: true };
    expect(getDisplayLabel(artwork)).toBe('촬영 보정 이미지');
  });
});
