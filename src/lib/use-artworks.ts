'use client';

import { useArtworksContext } from './artworks-context';

export function useArtworks() {
  return useArtworksContext();
}

export function useArtwork(id: string) {
  const { artworks, loading } = useArtworksContext();

  const artwork = artworks.find((a) => a.id === id) || null;
  const index = artworks.findIndex((a) => a.id === id);
  const prev = index > 0 ? artworks[index - 1] : null;
  const next = index >= 0 && index < artworks.length - 1 ? artworks[index + 1] : null;

  return { artwork, prev, next, loading };
}
