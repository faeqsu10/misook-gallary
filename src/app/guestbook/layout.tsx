import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '방명록',
  description: '작품을 감상하신 소감을 남겨주세요.',
};

export default function GuestbookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
