import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '갤러리',
  description: '정미숙 작가의 작품을 감상하세요. 인물, 추상, 드로잉 작품을 카테고리별로 탐색할 수 있습니다.',
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
