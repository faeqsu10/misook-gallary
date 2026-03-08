import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { adminDb } from '@/lib/firebase-admin';

const BASE_URL = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch published artworks from Firestore
  let workPages: MetadataRoute.Sitemap = [];
  try {
    const snapshot = await adminDb
      .collection('artworks')
      .where('visibility', 'in', ['public', 'link'])
      .select('updatedAt')
      .get();

    workPages = snapshot.docs.map((doc) => {
      const data = doc.data();
      const lastModified = data.updatedAt?.toDate() || now;
      return {
        url: `${BASE_URL}/works/${doc.id}`,
        lastModified,
        priority: 0.7 as const,
      };
    });
  } catch {
    // Fallback: if Firestore is unavailable, return static pages only
    console.error('Sitemap: Failed to fetch artworks from Firestore');
  }

  return [
    { url: BASE_URL, lastModified: now, priority: 1.0 },
    { url: `${BASE_URL}/gallery`, lastModified: now, priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: now, priority: 0.6 },
    ...workPages,
  ];
}
