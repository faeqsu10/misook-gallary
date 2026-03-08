import { describe, it, expect } from 'vitest';
import { artworks } from '@/data/artworks';

describe('Static artworks data', () => {
  it('has at least one artwork', () => {
    expect(artworks.length).toBeGreaterThan(0);
  });

  it('all artworks have required fields', () => {
    for (const artwork of artworks) {
      expect(artwork.id).toBeTruthy();
      expect(artwork.title).toBeTruthy();
      expect(artwork.image).toBeTruthy();
      expect(artwork.category).toMatch(/^(portrait|abstract|drawing)$/);
      expect(artwork.status).toMatch(/^(collection|exhibit|inquiry)$/);
      expect(typeof artwork.order).toBe('number');
    }
  });

  it('all artworks have unique IDs', () => {
    const ids = artworks.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('featured artworks exist', () => {
    const featured = artworks.filter((a) => a.featured);
    expect(featured.length).toBeGreaterThan(0);
  });
});
