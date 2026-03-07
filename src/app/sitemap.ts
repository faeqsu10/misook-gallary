import type { MetadataRoute } from 'next';
import { artworks } from '@/data/artworks';
import { SITE_URL } from '@/lib/constants';

const BASE_URL = SITE_URL;
const LAST_UPDATED = new Date('2026-03-08');

export default function sitemap(): MetadataRoute.Sitemap {
  const workPages = artworks.map((artwork) => ({
    url: `${BASE_URL}/works/${artwork.id}`,
    lastModified: LAST_UPDATED,
    priority: 0.7 as const,
  }));

  return [
    { url: BASE_URL, lastModified: LAST_UPDATED, priority: 1.0 },
    { url: `${BASE_URL}/gallery`, lastModified: LAST_UPDATED, priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: LAST_UPDATED, priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: LAST_UPDATED, priority: 0.6 },
    ...workPages,
  ];
}
