import { getArtwork } from '@/data/artworks';
import { artist } from '@/data/artist';
import { SITE_URL } from '@/lib/constants';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artwork = getArtwork(id);
  if (!artwork) return { title: '작품을 찾을 수 없습니다' };

  const imageUrl = artwork.image.startsWith('http')
    ? artwork.image
    : `${SITE_URL}${artwork.image}`;

  return {
    title: artwork.title,
    description: artwork.description || `${artist.name} 작가의 작품 "${artwork.title}"`,
    openGraph: {
      title: artwork.title,
      description: artwork.description || `${artist.name} 작가의 작품 "${artwork.title}"`,
      images: [{ url: imageUrl, alt: artwork.title }],
    },
  };
}

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
