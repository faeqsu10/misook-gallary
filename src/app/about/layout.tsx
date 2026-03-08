import type { Metadata } from 'next';
import { artist } from '@/data/artist';

export const metadata: Metadata = {
  title: '작가 소개',
  description: artist.bio.slice(0, 160),
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
