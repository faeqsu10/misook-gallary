# Misook Gallery - 정미숙 작가 개인 플랫폼

## Project Overview
정미숙 작가(홍익대 미술 전공)의 개인 작가 플랫폼. 쇼핑몰이 아닌 **작가 홈페이지** 컨셉.
핵심 가치: 작가적 자존감 회복, 부담 없는 문의 기반 판매 가능성.

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Vercel 배포
- 정적 데이터 (DB 없음, TypeScript 파일 기반)

## Project Structure
```
src/
  app/            # App Router pages
  components/     # Reusable UI components
  data/           # Static data (artworks.ts, artist.ts)
  lib/            # Types, utilities
public/
  artworks/       # Optimized artwork images
archive/          # Original artwork photos (23점)
```

## Design Direction
- Color: 화이트(#FAFAFA) + 차콜(#1A1A1A), 작품 색이 유일한 포인트
- Typography: 세리프(제목) + Pretendard(본문)
- Tone: "갤러리 화이트 큐브" - 미니멀, 조용, 넉넉한 여백
- 문구 톤: 따뜻하고 품위 있게. 상업적 표현 금지.

## Key Rules
- 판매 관련 표현은 "문의하기", "관심 있어요" 수준으로 부드럽게
- 작품 상태: 소장용 / 전시 가능 / 판매 문의 가능
- 공개 범위: 비공개 / 가족공유 / 링크공유 / 전체공개
- 미완성 작품도 업로드 가능 (완성작/작업중/스케치/아이디어)

## Pages
1. Home (/) - 대표작 히어로 + 소개 문장 + 추천작 미리보기
2. Gallery (/gallery) - 작품 그리드 + 카테고리/상태 필터
3. Work Detail (/works/[id]) - 큰 이미지 + 메타정보 + 문의 버튼
4. About (/about) - 작가 소개, 약력, 작업 방향
5. Contact (/contact) - 문의 폼 (구매/전시/응원)

## PRD
상세 기획: `.omc/plans/prd-misook-gallery.md`

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management
1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
