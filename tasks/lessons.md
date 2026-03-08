# Lessons Learned

## TypeScript / Next.js

### i18n `as const` 타입 충돌
- **문제**: `translations.ko`를 `as const`로 정의하면 리터럴 타입(`"갤러리"`)이 되어 `en` 객체(`"Gallery"`)와 호환 안됨
- **해결**: mapped type으로 함수 시그니처는 보존하고 string 값은 `string`으로 일반화
- **일반화**: `as const` 객체의 타입을 다형적으로 쓸 때는 항상 mapped type 사용

### i18n에 Record 타입 추가 시 Translations 타입 깨짐
- **문제**: `categoryLabels: Record<string, string>`을 추가했더니 기존 `string` 매핑 Translations 타입에서 `Record`를 `string`으로 변환
- **해결**: Translations mapped type에 `Record<string, string>` 분기 추가 (함수 → Record → string 순서)
- **일반화**: i18n 값 타입이 다양할수록 Translations mapped type을 더 세밀하게 분기

### Server Component vs Client Component 메타데이터
- **문제**: i18n(useContext)을 쓰려면 `'use client'`가 필요한데, `export const metadata`는 Server Component에서만 가능
- **해결**: `layout.tsx`에서 metadata export, `page.tsx`를 Client Component로 분리
- **일반화**: 메타데이터가 필요한 페이지에 클라이언트 훅을 넣을 때는 반드시 layout/page 분리 패턴

### intersection 타입 `never` 문제
- **문제**: `Omit<LogEntry, 'error'> & { error?: unknown }` — 같은 키의 타입 충돌로 `never`
- **해결**: 별도 `LogContext` 인터페이스 정의
- **일반화**: 같은 키를 다른 타입으로 override할 때 intersection 대신 새 인터페이스

### API 라우트에서 Firebase Client SDK 사용 불가
- **문제**: 서버(API 라우트)에서 Firebase Client SDK의 Auth 사용 불가
- **해결**: `firebase-admin` 패키지 사용, `FIREBASE_SERVICE_ACCOUNT` 환경변수로 인증
- **일반화**: 서버사이드에서 Firebase 접근은 항상 Admin SDK

## Vitest / 테스트

### jsdom + Node 18 ESM 호환 문제
- **문제**: `vitest` + `jsdom` 환경에서 `ERR_REQUIRE_ESM` — jsdom 의존성이 ESM 전용
- **해결**: 순수 유틸리티 테스트는 `environment: 'node'`로 설정, DOM 테스트가 필요할 때만 `happy-dom` 사용
- **일반화**: Node 18에서는 jsdom 대신 happy-dom 고려, 또는 DOM 불필요한 테스트는 node 환경

### vitest.config.ts ESM 로딩 실패
- **문제**: `vitest.config.ts`가 CJS로 로드되면서 ESM 모듈 import 실패
- **해결**: `vitest.config.mts`로 확장자 변경 (명시적 ESM)
- **일반화**: Vite/Vitest 설정 파일은 `.mts` 확장자로 ESM 보장

## 데이터 / 아키텍처

### 중복 fetch 문제
- **문제**: `useArtworks()` 훅이 마운트마다 Firestore fetch → 페이지 이동할 때마다 재요청
- **해결**: `ArtworksContext`로 한 번 fetch한 데이터를 전역 공유, hooks는 context를 참조
- **일반화**: 여러 페이지에서 같은 데이터를 쓰면 Context 또는 SWR로 캐싱

### 라벨 중복 정의
- **문제**: `categoryLabels`/`statusLabels`가 3개 컴포넌트에서 각각 정의 — i18n 키 추가 시 누락 위험
- **해결**: i18n 번역 객체에 `Record<string, string>` 맵으로 중앙화
- **일반화**: 라벨/상수는 한 곳에서만 정의, 여러 곳에서 참조

## 보안

### 클라이언트 rate limiting 우회 가능
- **문제**: localStorage 기반 rate limiting은 시크릿 모드나 스토리지 삭제로 우회 가능
- **해결**: 서버사이드 `/api/inquiry` 라우트 + Firestore IP 기반 rate limiting 추가
- **일반화**: 보안 관련 검증은 반드시 서버사이드, 클라이언트는 UX 용도로만

### 쿠키만으로 API 인증 부족
- **문제**: `__session` 쿠키 존재 여부만 체크 — 만료되거나 위조된 토큰 구분 불가
- **해결**: `adminAuth.verifyIdToken()`으로 서버에서 실제 토큰 검증
- **일반화**: API 인증은 토큰 존재 여부가 아닌 유효성 검증까지
