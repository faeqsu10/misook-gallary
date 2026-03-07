# Misook Gallery

정미숙 작가의 개인 미술관 웹사이트입니다.

## Overview

홍익대학교 도예과를 졸업한 정미숙 작가의 작품을 전시하는 온라인 갤러리입니다. "갤러리 화이트 큐브" 컨셉으로, 작품이 주인공이 되는 미니멀하고 조용한 공간을 지향합니다.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel
- **Fonts**: Noto Serif KR + Pretendard

## Pages

| 경로 | 설명 |
|------|------|
| `/` | 대표작 히어로 + 소개 문장 + 추천작 미리보기 |
| `/gallery` | 작품 그리드 + 카테고리/상태 필터 |
| `/works/[id]` | 작품 상세 (큰 이미지 + 메타정보 + 문의 버튼) |
| `/about` | 작가 소개, 약력, 작업 노트, 연보 |
| `/contact` | 문의 폼 (구매/전시/응원) |
| `/admin` | 관리자 로그인 |
| `/admin/dashboard` | 작품 관리 (CRUD) |
| `/admin/inquiries` | 문의 관리 |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in Firebase config values

# Run development server
npm run dev
# Opens on http://localhost:3030
```

## Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Project Structure

```
src/
  app/            # App Router pages
  components/     # Reusable UI components
  data/           # Static data (artworks, artist)
  lib/            # Types, utilities, Firebase, hooks
public/
  artworks/       # Optimized artwork images
```

## Design Principles

- **Color**: White (#FAFAFA) + Charcoal (#1A1A1A), artwork is the only color accent
- **Typography**: Noto Serif KR (headings) + Pretendard (body)
- **Tone**: Warm and dignified, never commercial
- **UX**: Gallery white cube aesthetic - minimal, quiet, generous whitespace

## License

All artwork images are copyrighted by the artist. Code is MIT licensed.
