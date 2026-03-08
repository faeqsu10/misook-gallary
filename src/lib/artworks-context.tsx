'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Artwork } from './types';
import { fetchArtworks } from './artworks-db';
import { artworks as staticArtworks } from '@/data/artworks';

interface ArtworksContextType {
  artworks: Artwork[];
  featured: Artwork[];
  loading: boolean;
}

const ArtworksContext = createContext<ArtworksContextType>({
  artworks: staticArtworks,
  featured: staticArtworks.filter((a) => a.featured),
  loading: true,
});

export function ArtworksProvider({ children }: { children: ReactNode }) {
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

  return (
    <ArtworksContext.Provider value={{ artworks, featured, loading }}>
      {children}
    </ArtworksContext.Provider>
  );
}

export function useArtworksContext() {
  return useContext(ArtworksContext);
}
