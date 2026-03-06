# Frontend Developer Memory

## Tech Stack
- Next.js 15.5.12 (App Router) + TypeScript
- Tailwind CSS 3 (NOT 4 - Node 18 incompatible with Tailwind 4/oxide)
- Noto Serif KR (Google Fonts) + Pretendard (CDN)
- Static site generation (SSG) - no server-side data

## Project Structure
- `src/app/` - Pages (home, gallery, works/[id], about, contact)
- `src/components/` - Header, Footer, ArtworkCard, ArtworkViewer, FilterBar, ContactForm
- `src/data/` - artworks.ts (23 works), artist.ts
- `src/lib/types.ts` - Artwork, Artist, filter types
- `public/artworks/` - 23 JPG images with semantic slugs

## Color System (tailwind.config.js)
- bg: #FAFAFA, text: #1A1A1A, muted: #6B6B6B, border: #E5E5E5, card-hover: #F5F5F5

## Build
- All pages static (SSG via generateStaticParams)
- First Load JS ~102kB shared
