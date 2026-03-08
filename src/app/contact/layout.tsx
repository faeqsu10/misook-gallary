import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '문의',
  description: '작품이 마음에 닿았다면 조용히 문의를 남겨주세요.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
