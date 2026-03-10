import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '작가 소개',
  description: '홍익대학교 도예과를 졸업한 정미숙 작가의 이야기. 오래 품어온 선과 형태를 다시 세상에 놓습니다.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
