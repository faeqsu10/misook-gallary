import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { I18nProvider } from '@/lib/i18n';
import { ArtworksProvider } from '@/lib/artworks-context';
import { SITE_URL } from '@/lib/constants';
import { artist } from '@/data/artist';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
  weight: '100 900',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${artist.name} — 선과 형태의 언어`,
    template: `%s — ${artist.name}`,
  },
  description:
    `오래 품어온 선과 형태를 다시 세상에 놓습니다. ${artist.name} 작가의 개인 미술관.`,
  keywords: [artist.name, '미술', '작가', '추상', '드로잉', '인물화', '갤러리'],
  authors: [{ name: artist.name }],
  openGraph: {
    title: `${artist.name} — 선과 형태의 언어`,
    description: '오래 품어온 선과 형태를 다시 세상에 놓습니다.',
    type: 'website',
    locale: 'ko_KR',
    siteName: `${artist.name} 갤러리`,
    images: [{ url: `${SITE_URL}/opengraph-image`, alt: '정미숙 갤러리' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: `${artist.name} 갤러리`,
              url: SITE_URL,
              description: `오래 품어온 선과 형태를 다시 세상에 놓습니다. ${artist.name} 작가의 개인 미술관.`,
              author: {
                '@type': 'Person',
                name: artist.name,
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        <I18nProvider>
          <ArtworksProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-text focus:text-bg focus:text-sm">
              본문으로 건너뛰기
            </a>
            <ScrollToTop />
            <Header />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </ArtworksProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
