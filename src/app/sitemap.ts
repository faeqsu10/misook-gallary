import type { MetadataRoute } from 'next';
import { artworks } from '@/data/artworks';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://misook-gallery.vercel.app';

  const workPages = artworks.map((artwork) => ({
    url: `${baseUrl}/works/${artwork.id}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.6 },
    ...workPages,
  ];
}
