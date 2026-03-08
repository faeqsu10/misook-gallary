import type { Metadata } from 'next';
import { Noto_Serif_KR } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { I18nProvider } from '@/lib/i18n';
import { SITE_URL } from '@/lib/constants';
import { artist } from '@/data/artist';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif-kr',
  display: 'swap',
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
    <html lang="ko" className={notoSerifKR.variable}>
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
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
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
          <ScrollToTop />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
