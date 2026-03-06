'use client';

import { useState, useEffect } from 'react';
import { Artwork } from './types';
import { fetchArtworks } from './artworks-db';
import { artworks as staticArtworks } from '@/data/artworks';

export function useArtworks() {
  const [artworks, setArtworks] = useState<Artwork[]>(staticArtworks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtworks()
      .then((data) => {
        if (data.length > 0) setArtworks(data);
      })
      .catch(() => {
        // Firestore unavailable, keep static data
      })
      .finally(() => setLoading(false));
  }, []);

  const featured = artworks.filter((a) => a.featured);

  return { artworks, featured, loading };
}

export function useArtwork(id: string) {
  const { artworks, loading } = useArtworks();

  const artwork = artworks.find((a) => a.id === id) || null;
  const index = artworks.findIndex((a) => a.id === id);
  const prev = index > 0 ? artworks[index - 1] : null;
  const next = index < artworks.length - 1 ? artworks[index + 1] : null;

  return { artwork, prev, next, loading };
}
