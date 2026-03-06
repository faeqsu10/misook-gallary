# PRD: Misook Gallery - 정미숙 작가 개인 플랫폼

## Problem Statement

정미숙 작가는 홍익대학교에서 미술을 전공했지만, 가정에 헌신하며 오랜 시간 창작 활동을 중단했다. 현재 23점의 작품이 존재하지만, 이를 세상에 보여줄 공간이 없다. 단순한 쇼핑몰이 아닌, **작가로서의 자존감을 회복**하고 **작품의 가치를 세상에 알릴 수 있는 개인 작가 플랫폼**이 필요하다.

## Goals

1. 정미숙 작가의 작품을 품위 있게 전시하는 온라인 개인 미술관 구축
2. 작가 소개를 통해 삶의 서사와 예술 세계를 전달
3. 부담 없는 "문의 기반" 판매 가능성 제공 (결제 시스템 없음)
4. 가족/지인이 쉽게 감상하고 공유할 수 있는 구조
5. 반응형 디자인으로 모바일/데스크톱 모두 지원
6. 작품 이미지가 돋보이는 미니멀하고 격조 있는 UI

## Non-Goals

- 결제/장바구니/배송 등 이커머스 기능
- 회원가입/로그인 시스템 (MVP)
- CMS/관리자 페이지 (MVP - 코드 기반으로 관리)
- 댓글/가족 코멘트 기능 (2단계)
- AI 제목/설명 생성 기능 (2단계)
- 다국어 지원

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Image Optimization**: Next.js Image component
- **Deployment**: Vercel
- **Data**: 정적 데이터 (JSON/TypeScript 파일 기반, DB 없음)
- **Form**: 문의 폼 (이메일 전송 또는 외부 서비스 연동)
- **Font**: Pretendard (한글) + serif 계열 (영문 제목용)

## Architecture

```
src/
  app/
    layout.tsx          # 공통 레이아웃 (네비게이션, 푸터)
    page.tsx             # Home
    gallery/
      page.tsx           # Gallery (작품 목록)
    works/
      [id]/
        page.tsx         # Work Detail (작품 상세)
    about/
      page.tsx           # About (작가 소개)
    contact/
      page.tsx           # Contact (문의)
  components/
    Header.tsx
    Footer.tsx
    ArtworkCard.tsx      # 갤러리 썸네일 카드
    ArtworkViewer.tsx    # 작품 상세 뷰어 (확대 가능)
    ContactForm.tsx
    FilterBar.tsx        # 갤러리 필터
  data/
    artworks.ts          # 작품 데이터 (제목, 설명, 카테고리, 상태 등)
    artist.ts            # 작가 정보
  lib/
    types.ts             # TypeScript 타입 정의
  public/
    artworks/            # 최적화된 작품 이미지 (archive에서 복사/리네임)
```

## Pages & Acceptance Criteria

### 1. Home (/)

- [ ] 대표작 1점이 히어로 섹션에 크게 표시됨
- [ ] 작가 소개 한 줄 문구 표시: "오래 품어온 선과 형태를 다시 세상에 놓습니다."
- [ ] "작품 보기" CTA 버튼 -> /gallery 이동
- [ ] 최근/추천 작품 3~4점 미리보기 섹션
- [ ] 반응형: 모바일에서도 자연스러운 레이아웃

### 2. Gallery (/gallery)

- [ ] 작품 썸네일 그리드 (2열 모바일 / 3열 데스크톱)
- [ ] 각 카드: 썸네일 + 제목 + 연도
- [ ] 카테고리 필터: 전체 / 인물 / 추상 / 드로잉
- [ ] 작품 상태 필터: 전체 / 소장용 / 문의 가능
- [ ] 카드 클릭 시 /works/[id]로 이동
- [ ] 호버 시 부드러운 확대 애니메이션

### 3. Work Detail (/works/[id])

- [ ] 작품 이미지 크게 표시 (클릭 시 원본 크기 모달)
- [ ] 제목, 제작연도, 재료, 크기 정보
- [ ] 작가의 짧은 메모/설명 (있는 경우)
- [ ] 작품 상태 표시: "소장용" / "전시 가능" / "판매 문의 가능"
- [ ] "문의하기" 버튼 -> /contact로 이동 (작품명 자동 전달)
- [ ] 이전/다음 작품 네비게이션

### 4. About (/about)

- [ ] 작가 프로필 사진 영역 (placeholder 가능)
- [ ] 작가 소개 텍스트 (홍대 출신, 가정에 헌신, 다시 시작한 이야기)
- [ ] 약력/연보 섹션
- [ ] 작가 철학/작업 방향 섹션

### 5. Contact (/contact)

- [ ] 문의 폼: 이름, 이메일, 문의유형(작품구매/전시/응원), 메시지
- [ ] 작품 상세에서 넘어온 경우 작품명 자동 기입
- [ ] 폼 제출 시 성공 메시지 표시
- [ ] "작품이 마음에 닿았다면 조용히 문의를 남겨주세요" 안내 문구

### 6. 공통 (Layout)

- [ ] 상단 네비게이션: 로고(정미숙) + Home / Gallery / About / Contact
- [ ] 푸터: 저작권 표시, 간단한 문구
- [ ] 전체 톤: 미니멀, 화이트 배경, 작품이 주인공
- [ ] 페이지 전환 부드러운 트랜지션
- [ ] SEO 메타태그 (og:image 등)
- [ ] 모바일 햄버거 메뉴

## Design Direction

- **Color**: 화이트(#FAFAFA) 배경 + 차콜(#1A1A1A) 텍스트 + 포인트 없음 (작품 색이 포인트)
- **Typography**: 제목은 세리프(격조), 본문은 산세리프(가독성)
- **Spacing**: 넉넉한 여백, 작품 이미지에 충분한 공간
- **Tone**: "갤러리 화이트 큐브" 느낌. 깔끔하고 조용한 공간
- **Animation**: 최소한 - 스크롤 시 fade-in, 호버 시 subtle scale 정도

## Data Model

```typescript
interface Artwork {
  id: string;
  title: string;
  year?: string;
  medium?: string;        // 재료 (연필, 마커, 혼합재료 등)
  dimensions?: string;    // 크기
  category: 'portrait' | 'abstract' | 'drawing';
  status: 'collection' | 'exhibit' | 'inquiry';  // 소장용/전시가능/문의가능
  description?: string;   // 작가 메모
  image: string;          // 이미지 경로
  featured?: boolean;     // 대표작 여부
  order: number;          // 정렬 순서
}

interface Artist {
  name: string;
  nameEn: string;
  bio: string;
  statement: string;
  history: { year: string; content: string }[];
}
```

## Implementation Phases

### Phase 1: Foundation (현재 MVP)
1. Next.js 프로젝트 초기화 + Tailwind 설정
2. 공통 레이아웃 (Header, Footer, 네비게이션)
3. 작품 데이터 구조 생성 + 이미지 준비
4. Home 페이지
5. Gallery 페이지 (필터 포함)
6. Work Detail 페이지
7. About 페이지
8. Contact 페이지 (폼 UI)
9. 반응형 + 모바일 최적화
10. Vercel 배포

### Phase 2: Enhancement
- 가족 감상 댓글 기능
- AI 작품 제목/설명 제안
- 작품 시리즈 묶기
- 이메일 알림 연동 (문의 접수 시)
- 작품 업로드 관리자 페이지

### Phase 3: Growth
- 프린트 주문 기능
- 뉴스레터
- 전시 페이지 (기획전 형태)
- 굿즈 미리보기

## Image Preparation

archive/ 폴더의 23개 JPG 파일을 다음과 같이 처리:
1. 파일명을 의미 있는 slug로 변경 (예: witch.jpg, abstract-composition-01.jpg)
2. public/artworks/ 에 복사
3. Next.js Image 컴포넌트로 자동 최적화 활용
4. 각 작품에 대한 메타데이터를 data/artworks.ts에 기록

## Success Metrics

- 어머니가 "내 미술관이 생겼다"고 느끼시는 것
- 가족/지인에게 링크를 공유했을 때 "작가 홈페이지"처럼 보이는 것
- 모바일에서 작품 감상이 편안한 것
- 문의 폼을 통해 실제 메시지를 받을 수 있는 것
