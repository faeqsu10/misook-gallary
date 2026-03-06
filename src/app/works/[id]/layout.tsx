import { getArtwork } from '@/data/artworks';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artwork = getArtwork(id);
  if (!artwork) return { title: '작품을 찾을 수 없습니다' };
  return {
    title: `${artwork.title} — 정미숙`,
    description: artwork.description || `정미숙 작가의 작품 "${artwork.title}"`,
  };
}

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
