import type { Metadata } from 'next';
import { Noto_Serif_KR } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://misook-gallery.vercel.app'),
  title: {
    default: '정미숙 — 선과 형태의 언어',
    template: '%s — 정미숙',
  },
  description:
    '오래 품어온 선과 형태를 다시 세상에 놓습니다. 정미숙 작가의 개인 미술관.',
  keywords: ['정미숙', '미술', '작가', '추상', '드로잉', '인물화', '갤러리'],
  authors: [{ name: '정미숙' }],
  openGraph: {
    title: '정미숙 — 선과 형태의 언어',
    description: '오래 품어온 선과 형태를 다시 세상에 놓습니다.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '정미숙 갤러리',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSerifKR.variable}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ScrollToTop />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
