import type { Metadata } from 'next';
import { artist } from '@/data/artist';

export const metadata: Metadata = {
  title: '갤러리',
  description: `${artist.name} 작가의 인물, 추상, 드로잉 작품을 감상하세요.`,
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
