# [프로젝트명] - CLAUDE.md Template

> 이 파일을 새 프로젝트의 `CLAUDE.md`로 복사하고, [대괄호] 항목을 프로젝트에 맞게 수정하세요.
> 프로젝트별 섹션(Project Overview ~ Pages)은 프로젝트에 맞게 작성하고,
> 하단의 Workflow/Principles 섹션은 그대로 사용하세요.

---

## Project Overview
[프로젝트 한줄 설명]
핵심 가치: [이 프로젝트가 해결하는 문제 또는 제공하는 가치]

## Tech Stack
- [프레임워크] (예: Next.js 15 App Router)
- [언어] (예: TypeScript)
- [스타일링] (예: Tailwind CSS 3)
- [DB/백엔드] (예: Firebase Firestore, Supabase, Prisma 등)
- [배포] (예: Vercel, AWS 등)
- [기타] (예: Google Analytics, Gemini API 등)

## Project Structure
```
src/
  app/            # 페이지 (App Router)
  components/     # 재사용 UI 컴포넌트
  data/           # 정적 데이터
  lib/            # 타입, 유틸, 훅
public/           # 정적 파일
docs/             # 문서 (dev-log.md 등)
tasks/            # 할일, 교훈
```

## Design Direction
- [색상 팔레트]
- [타이포그래피]
- [전체 톤 & 무드]

## Pages
[주요 페이지 목록과 역할]

---

## Workflow Orchestration

### 1. Plan Mode Default
- 3단계 이상 또는 아키텍처 결정이 필요한 작업은 반드시 계획 먼저
- 진행 중 문제 발생 시 즉시 멈추고 재계획 — 밀어붙이지 않기
- 검증 단계도 계획에 포함
- 사전에 상세 스펙을 작성하여 모호함 제거

### 2. Subagent Strategy
- 메인 컨텍스트 윈도우를 깨끗하게 유지하기 위해 서브에이전트 적극 활용
- 리서치, 탐색, 병렬 분석은 서브에이전트에 위임
- 복잡한 문제에는 서브에이전트로 더 많은 컴퓨팅 투입
- 서브에이전트 1개당 작업 1개로 집중 실행

### 3. Self-Improvement Loop
- 사용자로부터 수정 피드백 받으면 즉시 `tasks/lessons.md`에 패턴 기록
- 같은 실수를 방지하는 규칙을 스스로 작성
- 실수율이 낮아질 때까지 교훈을 반복적으로 개선
- 세션 시작 시 관련 프로젝트의 교훈 리뷰

### 4. Verification Before Done
- 작동함을 증명하지 않고는 절대 완료 처리하지 않기
- 변경 전후 동작 차이를 비교
- "시니어 엔지니어가 승인할 수준인가?" 자문
- 빌드, 테스트, 로그 확인으로 정확성 입증

### 5. Demand Elegance (Balanced)
- 비사소한 변경: "더 우아한 방법이 있는가?" 잠시 멈춰서 생각
- 임시방편 느낌이면: "지금 아는 모든 것을 바탕으로 우아한 솔루션 구현"
- 단순하고 명확한 수정에는 과도한 엔지니어링 금지
- 제출 전 자기 작업에 도전하기

### 6. Autonomous Bug Fixing
- 버그 리포트 받으면 질문 없이 바로 수정
- 로그, 에러, 실패 테스트를 찾아서 해결
- 사용자의 컨텍스트 스위칭 비용 제로
- CI 실패도 지시 없이 스스로 수정

## Task Management
1. **Plan First**: `tasks/todo.md`에 체크 가능한 항목으로 계획 작성
2. **Verify Plan**: 구현 시작 전 사용자와 확인
3. **Track Progress**: 진행하면서 완료 항목 체크
4. **Explain Changes**: 각 단계마다 고수준 요약 제공
5. **Document Results**: `tasks/todo.md`에 리뷰 섹션 추가
6. **Capture Lessons**: 수정 후 `tasks/lessons.md` 업데이트
7. **Dev Log**: 기능 완료 시 `docs/dev-log.md`에 항목 추가 (Phase별, 커밋 해시, 날짜)

## Core Principles
- **Simplicity First**: 모든 변경을 최대한 단순하게. 최소 코드 영향.
- **No Laziness**: 근본 원인 찾기. 임시 수정 금지. 시니어 개발자 기준.
- **Minimal Impact**: 필요한 것만 건드리기. 버그 유발 방지.

---

## Technical Patterns & Lessons

### Next.js App Router
- `'use client'` 지시자: 클라이언트 훅(useState, useEffect, useContext)을 사용하는 컴포넌트에 필수
- Server Component에서는 `export const metadata` 사용 가능, Client Component에서는 불가
- `layout.tsx`에서 Provider 래핑 시 `'use client'`가 아닌 layout 자체에는 불필요
- `next/script`의 `strategy="afterInteractive"`는 GA 같은 서드파티 스크립트에 사용
- 동적 라우트: `[id]` 폴더 + `useParams()` 훅
- API 라우트에서 body size 제한 주의 — 큰 이미지는 클라이언트에서 리사이즈 후 전송

### TypeScript
- `as const` 어설션 사용 시 리터럴 타입이 되므로, 다국어 같은 동적 값에는 별도 타입 정의 필요
- `typeof obj.ko`를 타입으로 쓸 때 `en` 객체 호환 문제 → mapped type으로 string 일반화
- catch 블록의 `err`는 `unknown` 타입 — `serializeError()` 헬퍼로 안전하게 변환
- Record<string, unknown>을 metadata에 사용하면 유연한 구조화 로깅 가능
- intersection 타입(`A & B`)에서 같은 키의 타입 충돌 시 `never`가 될 수 있음 → 별도 인터페이스 정의

### Tailwind CSS
- v3와 v4는 설정 방식이 다름 — Node 18에서는 v3 사용
- CSS 변수로 색상 정의: `--color-bg`, `--color-text` 등 → `bg-bg`, `text-text`로 사용
- `max-h-[75vh]`로 이미지 뷰포트 맞춤
- `backdrop-blur-sm` + `bg-bg/95`로 글래스모피즘 헤더
- 반응형: `md:` 브레이크포인트 기준으로 모바일/데스크톱 분기

### Firebase (Client-side)
- `getApps().length === 0` 체크로 싱글톤 초기화
- Firestore 규칙: `{allPaths=**}`는 하위 전체, `{fileName}`은 직계 자식만
- Storage 서브디렉토리 사용 시 규칙에 `{allPaths=**}` 필수
- `serverTimestamp()`는 Firestore 서버 시간 — 클라이언트 시간 신뢰하지 않기
- Composite index 필요 시 첫 쿼리에서 콘솔에 생성 링크가 뜸
- 인증 세션: `__session` 쿠키 사용 (Vercel 호환)

### i18n (다국어 지원)
- React Context + localStorage 패턴: 가벼우면서 SSR 호환
- 번역 객체는 `as const`로 정의하되, 타입은 함수 시그니처 보존하는 mapped type 사용
- `html lang` 속성은 `useEffect`로 동적 변경 (접근성 + SEO)
- 서버 컴포넌트는 `useContext` 사용 불가 → 클라이언트 컴포넌트로 전환 필요
- 하드코딩된 라벨 상수(`CATEGORY_LABELS` 등)를 i18n으로 전환 시 누락하기 쉬움 — grep으로 전수 확인

### Logging
- Vercel(서버리스)에서는 파일 로깅 불가 → Firestore + 구조화 콘솔 조합
- 서버(API 라우트)에서는 Firebase client SDK 사용 불가 → `console.error(JSON.stringify(...))`로 구조화
- 클라이언트 관리자 페이지에서는 Firestore에 직접 로그 저장
- 로그 레벨: error(항상 저장), info(감사 추적), warn(콘솔만)
- 관리자 로그 뷰어로 Vercel 대시보드 없이도 에러 확인 가능

### Image Handling
- 외부 API 전송 전 Canvas로 리사이즈 (max 1024px, JPEG 85%)
- Next.js API body size 제한 (기본 1MB) — 큰 이미지는 클라이언트에서 압축
- `next/image`의 `fill` + `object-cover` + `sizes` 속성으로 반응형 이미지
- Object URL 사용 시 반드시 `URL.revokeObjectURL()`로 메모리 해제

### Security
- Honeypot 필드로 봇 스팸 방지
- 클라이언트 rate limiting: localStorage 타임스탬프 (우회 가능하지만 간단)
- API 라우트 인증: `__session` 쿠키 확인
- CSP, X-Frame-Options 등 보안 헤더 설정
- 입력 길이 제한 (이름 100자, 메시지 5000자 등)
- 환경변수에 민감 정보 (.env는 .gitignore)

### SEO
- `metadata` export: title template(`%s — 사이트명`), description, keywords, openGraph
- robots.ts + sitemap.ts로 검색엔진 가이드
- JSON-LD 구조화 데이터 (`WebSite`, `VisualArtwork` 등)
- `<link rel="preconnect">` 외부 폰트 CDN에 적용
- Canonical URL 설정

### UX Patterns
- 스켈레톤 로딩 (shimmer 애니메이션) — 빈 화면 대신 로딩 상태 표시
- Staggered 애니메이션: `animationDelay`로 순차적 진입 효과
- 페이지 이동 시 `ScrollToTop` 컴포넌트
- "더 보기" 패지네이션: `visibleCount` state + 필터 변경 시 리셋
- 모바일 네비게이션: 햄버거 → X 애니메이션 (CSS transform)
- ESC 키로 모달/뷰어 닫기

---

## Common Pitfalls & Solutions

| 문제 | 원인 | 해결 |
|------|------|------|
| `Request Entity Too Large` | Next.js API body 제한 | 클라이언트에서 Canvas 리사이즈 후 전송 |
| Firestore 서브디렉토리 접근 거부 | Storage 규칙 `{fileName}` | `{allPaths=**}`로 변경 |
| HTML entity 렌더링 안됨 | `&nearr;` 등 JSX에서 미지원 | 유니코드 직접 사용 (`↗`) |
| i18n 타입 에러 | `as const` 리터럴 타입 불일치 | mapped type으로 string 일반화 |
| catch 블록 `unknown` 타입 | TypeScript strict mode | `serializeError()` 헬퍼 사용 |
| 하이드레이션 불일치 | localStorage 초기값 ≠ 서버 렌더링 | useState lazy initializer + 사소한 flash 허용 |
| 모델 이름 변경 | Gemini API 모델 업데이트 | 환경변수로 외부화, 하드코딩 금지 |
| intersection 타입 충돌 | `Omit<A> & { same_key: different_type }` | 별도 인터페이스 정의 |

---

## Project Initialization Checklist

새 프로젝트 시작 시:
- [ ] 이 파일을 `CLAUDE.md`로 복사, 상단 프로젝트 정보 수정
- [ ] `tasks/todo.md` 생성 — 초기 할일 목록
- [ ] `tasks/lessons.md` 생성 — 빈 파일
- [ ] `docs/dev-log.md` 생성 — Phase 1부터 기록 시작
- [ ] `.gitignore`에 `.env`, `.claude/`, `.omc/` 추가
- [ ] ESLint + TypeScript strict mode 설정
- [ ] 디자인 시스템 색상/폰트를 CSS 변수로 정의
- [ ] 로깅 유틸리티 (`src/lib/logger.ts`) 초기 세팅
- [ ] SEO 기본 설정 (metadata, robots, sitemap)
- [ ] 보안 헤더 미들웨어 설정

---

## Communication Preferences
- 한국어로 모든 소통
- 기술 용어와 코드 식별자는 원문 유지
- 커밋 메시지는 영어
- 마일스톤마다 자동 커밋 + 푸시
- 개발 서버 포트: [포트번호]
