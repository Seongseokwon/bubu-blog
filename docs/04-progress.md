# 04. 진행 현황

> **작업을 시작하고 끝낼 때마다 이 문서를 갱신한다.** 다음 세션의 유일한 인수인계 수단이다.
> 갱신 규칙: 체크박스 `[ ]` → `[x]`, §1 "현재 위치" 표 갱신, §6 로그에 1줄 추가

**최종 갱신**: 2026-08-04 · **현재 단계**: W1 기반 구현 중

---

## 1. 현재 위치

| 단계 | 상태 | 산출물 |
|---|---|---|
| 시안 분석 | ✅ 완료 | `index.html` rev.2 전수 분석 |
| 디자인 시스템 | ✅ 완료 | `01-design-system.md` |
| 서비스 기획 | ✅ 완료 | `02-service-plan.md` |
| 기술 명세 | ✅ 완료 | `03-tech-spec.md` (Payload 기준) |
| 문서화 체계 | ✅ 완료 | `CLAUDE.md`, `04-progress.md`, `05-decisions.md` |
| **미결정 사항 정리** | ✅ 완료 | W1 차단 4건(D-07~D-12) 확정, W2 이후 10건 대기 |
| W1 구현 | 🟡 **진행 중** | 패키지·Payload 설정·컬렉션 스키마 골격 |
| W2 구현 | ⬜ 미착수 | — |
| W3 구현 | ⬜ 미착수 | — |
| W4 구현 | ⬜ 미착수 | — |

### ✅ W1 착수 조건 충족

아래 4건이 확정되어 스키마·시드 작업을 시작할 수 있다. 세부 근거는 [`05-decisions.md`](05-decisions.md)에 기록했다.

- [x] **D-07** '주방' 카테고리를 `living`에 흡수하고 301 처리
- [x] **D-08** 경험방식·상황·규모 태그를 분리
- [x] **D-09** `재구매/재방문/재숙박`을 `wouldRepeat`로 통합
- [x] **D-12** `COMPARISON` 타입은 v1.1로 연기

나머지 10건은 W2 이후에 정해도 무방하다. → [`05-decisions.md`](05-decisions.md)

### 🟡 현재 작업 상태

- [x] `package.json`, TypeScript, Next.js, PostCSS, 환경 변수 템플릿 구성
- [x] Payload 설정·PostgreSQL/R2 어댑터 골격 구성
- [x] 리뷰 5종·카테고리·태그·미디어·사용자·댓글·구독·제휴 컬렉션 구성
- [x] 발행 검증·자동 태그·재검증 훅 구성
- [x] Admin / REST 라우트 골격 구성
- [x] 카테고리·태그 taxonomy 시드 구성
- [x] `pnpm install` 및 타입 검증 — `generate:types`, `typecheck` 통과
- [ ] Docker PostgreSQL 연결·migration 및 리뷰 12건 fixture 시드
- [ ] 디자인 토큰·Tailwind 이식 및 W2 홈 퍼블리싱

---

## 2. W1 — 기반 구축

**목표**: 프론트 없이도 어드민에서 모든 타입의 리뷰를 입력할 수 있는 상태
**게이트**: 어드민에서 `PRODUCT` / `TRIP` / `STAY` 리뷰를 각 1건씩 입력 성공

### 2.1 프로젝트 셋업
- [ ] `create-payload-app` 스캐폴딩 (Postgres 템플릿)
- [ ] Payload 패키지 버전 고정 (`payload`, `@payloadcms/next`, `db-postgres`, `richtext-lexical` 동일 버전)
- [ ] PostgreSQL 로컬 + 원격(Neon/Railway) 연결
- [ ] `.env.example` 작성 (`PAYLOAD_SECRET`, `DATABASE_URI`, `R2_*`, `RESEND_API_KEY`)
- [ ] ESLint + Prettier + TypeScript strict
- [ ] Git 커밋 컨벤션 정하기

### 2.2 컬렉션 스키마
- [ ] `users` (auth, role 기반 접근제어, 권한상승 차단)
- [ ] `media` (R2 업로드, imageSizes 3종, **alt 필수**)
- [ ] `categories` (6종)
- [ ] `tags` (D-08 결정 반영)
- [ ] `reviews` — 공통 필드
- [ ] `reviews` — 타입별 조건부 그룹 (`tripDetail` / `stayDetail` / `comparison`)
- [ ] `comments`
- [ ] `subscribers`
- [ ] `newsletter-issues`
- [ ] `affiliate-links` / `affiliate-clicks`
- [ ] Global `site-settings` (히어로 카피, 트러스트 라벨, 원칙 5개, `showTravelSection`)
- [x] `payload-types.ts` 생성 확인 (생성 파일은 `.gitignore` 처리)

### 2.3 스토리지·플러그인
- [ ] `@payloadcms/storage-s3` R2 연결 (**`region: 'auto'`**)
- [ ] `media` beforeChange 훅 — **blur placeholder 직접 생성** (sharp 20px base64)
- [ ] `@payloadcms/plugin-seo`
- [ ] `@payloadcms/plugin-nested-docs` (여행 부모-자식)
- [x] `@payloadcms/plugin-redirects`

### 2.4 시드 데이터
- [ ] 카테고리 6종 (D-07 반영)
- [ ] 상황 태그 (D-08 반영)
- [ ] 관리자 계정 2개
- [ ] 시안의 리뷰 12건 (물건 6 + 여행 3 + 최근 3)

### 2.5 디자인 토큰 이식
- [ ] `globals.css` — `:root` 라이트 토큰 16종
- [ ] `globals.css` — `[data-theme="dark"]` 다크 토큰 16종
- [ ] **신규 토큰 3종**: `--color-on-primary`, `--color-tag-accent`, `--color-focus-ring`
- [ ] Tailwind v4 설정 (`darkMode: ['selector', '[data-theme="dark"]']`)
- [ ] Pretendard `next/font/local` 자체 호스팅
- [ ] `placeholder-art.css` (CSS 아트 fallback 10종)

---

## 3. W2 — 홈 퍼블리싱 + 다크 모드

**목표**: 홈이 시안과 픽셀 단위로 일치하고, 다크 모드가 완전히 동작
**게이트**: 시각적 diff 통과 + 다크 모드 axe 위반 0건
**이 시점부터 콘텐츠 집필 병행 가능** (어드민이 W1에 완성되므로)

### 3.1 UI 프리미티브
- [ ] `Button` (primary / secondary / text)
- [ ] `Tag` (primary / terracotta / neutral)
- [ ] `Rating` · `Eyebrow` · `TextLink` · `IconButton`
- [ ] `SectionHeading` · `Container` · `SkipLink`
- [ ] `FilterChip`

### 3.2 레이아웃
- [ ] `SiteHeader` (sticky, scroll>12px 시 `.scrolled`)
- [ ] `PrimaryNav` — **카테고리 단일 소스에서 렌더링** (D-10)
- [ ] `MobileMenuToggle` (body scroll lock, `inert` 처리)
- [ ] `SearchDialog` (**포커스 트랩 추가**, ESC, ⌘K)
- [ ] `SiteFooter` · `ScrollTopButton`
- [ ] `ThemeToggle`

### 3.3 홈 섹션 (시안 순서 유지)
- [ ] 히어로 + 플로팅 라벨 3개
- [ ] 트러스트 스트립 — **실제 집계값** (하드코딩 금지)
- [ ] 카테고리 그리드 6종
- [ ] 이번 달 많이 읽은 리뷰 (featured 1 + 서브 2)
- [ ] 시간이 지나도 만족한 제품
- [ ] **여행 섹션** (`.travel-card` 3종, `showTravelSection` 연동)
- [ ] 최근 리뷰 + 상황 필터 칩
- [ ] 이렇게 리뷰합니다 (**원칙 5개**)
- [ ] 뉴스레터 폼
- [ ] 반응형 3단계 검수 (≥1024 / ≤1023 / ≤767)

### 3.4 다크 모드
- [ ] `next-themes` (`attribute="data-theme"`) 도입, FOUC 방지 확인
- [ ] **리터럴 색 12곳 토큰 승격** (`01-design-system.md` §2 표)
- [ ] 대비 수정 3건: CTA(2.35→7.11) / 테라코타 태그(2.09→5.31) / 포커스 링
- [ ] 라이트 대비 미달 3건 보정 (`text-muted`, `accent`, `warning`)
- [ ] CI에 리터럴 HEX 금지 lint 추가

### 3.5 알려진 회귀 위험
- [ ] 모바일 2열에 **원칙 5개** → 마지막 셀 정렬 (`:last-child:nth-child(odd)`)
- [ ] 카드 전체 `<a>` → **제목 링크 + `::after` 확장 클릭영역**으로 변경

---

## 4. W3 — 상세 페이지 + 여행 도메인

**목표**: 모든 리뷰 타입의 상세 페이지와 목록/검색이 동작
**게이트**: `TRIP` 1건 + 하위 `STAY` 1건을 연결해 발행하고 화면에서 확인

### 4.1 리뷰 상세
- [ ] 헤더 (브레드크럼·메타 배지·별점·평가변경)
- [ ] **결론 박스 5종 분기** (`PRODUCT`/`TRIP`/`STAY`/`PLACE`/`COMPARISON`)
- [ ] 제휴 고지 배너 (본문 상단, 링크 있을 때만)
- [ ] Lexical 렌더 + 목차(ToC)
- [ ] 재평가 타임라인 (`scores` 2건 이상일 때)
- [ ] 구매 링크 카드 (`/go/[id]` 경유)
- [ ] 관련 리뷰 3건
- [ ] 커버 이미지 높이 제한 (모바일 max 60vh — 결론 박스 above the fold)

### 4.2 목록·탐색
- [ ] `/reviews` (필터 + 정렬 + 페이지네이션, URL searchParams 반영)
- [ ] `/categories/[slug]` · `/tags/[slug]`
- [ ] `/longevity`
- [ ] `/search` + 검색 모달 서버 검색 (디바운스 250ms)
- [ ] `/about`

### 4.3 여행 도메인
- [ ] `/travel` 허브
- [ ] 경비 breakdown UI (합계 검증 포함)
- [ ] 일자별 동선 타임라인
- [ ] 부모-자식 리뷰 연결 표시
- [ ] `COMPARISON` 비교표 (모바일 가로 스크롤) — *D-12에서 연기 시 제외*

---

## 5. W4 — 검증·부가기능·SEO·배포

**목표**: 오픈 가능 상태
**게이트**: Lighthouse 모바일 성능 90+, 접근성 100 (라이트·다크 모두)

### 5.1 발행 검증 (핵심)
- [ ] `validatePublish` 훅 — 공통 규칙
- [ ] 타입별 규칙 5종 (총경비·동선·1박요금·비교 pick 1개)
- [ ] `deriveAutoTags` 훅 (`wouldRepeat` → 태그 자동)
- [ ] `revalidateReview` 훅 (슬러그 변경 시 옛 경로 무효화 포함)
- [ ] 협찬(`sponsored`/`invited`) 배지 자동 부착

### 5.2 인증·댓글
- [ ] 카카오 OAuth Route Handler (`state` nonce 검증)
- [ ] 소셜 계정 **로컬 로그인 차단** (`beforeLogin`)
- [ ] 댓글 작성·수정·삭제·대댓글 1단계
- [ ] 댓글 신고 → 3회 시 자동 숨김
- [ ] 리뷰 반응 ("도움이 됐어요")
- [ ] Turnstile (댓글·구독)
- [ ] Redis rate limit

### 5.3 뉴스레터·제휴
- [ ] 구독 신청 → Resend 확인 메일 (**더블 옵트인**)
- [ ] `/newsletter/confirm` · `/unsubscribe`
- [ ] 뉴스레터 이슈 작성·발송
- [ ] `/go/[linkId]` 리다이렉트 + 클릭 집계
- [ ] 조회수 (Redis 카운터 + 5분 배치 flush)
- [ ] GA4

### 5.4 SEO
- [ ] `generateMetadata` 전 페이지
- [ ] **JSON-LD 5종 분기** (`Product`/`TouristTrip`/`Hotel`/`Restaurant`/`ItemList`)
- [ ] OG 이미지 동적 생성 (`next/og`)
- [ ] `sitemap.ts` · `robots.ts` · `feed.xml`
- [ ] 301 리다이렉트 (`/categories/kitchen` → `living`)
- [ ] canonical · 2페이지 이상 `noindex`

### 5.5 마감
- [ ] 접근성 감사 (axe + 키보드 전체 순회, **라이트·다크 양쪽**)
- [ ] Lighthouse 성능 튜닝
- [ ] Playwright E2E (발행 → 노출 → 필터 → 댓글)
- [ ] 보안 헤더 + CSP
- [ ] 배포 파이프라인 (GitHub Actions)
- [ ] **실 콘텐츠 8건 입력** (물건 5 + 여행 3)
- [ ] Search Console 등록 + sitemap 제출

---

## 6. 작업 로그

새 항목은 **위에 추가**한다. 형식: `날짜 · 무엇을 했나 · 다음 할 일`

| 날짜 | 내용 | 다음 |
|---|---|---|
| 2026-08-04 | W1 차단 결정 4건 확정 — D-07 주방 흡수, D-08 태그 분리, D-09 `wouldRepeat` 통합, D-12 비교 v1.1 연기 | W1 스캐폴딩·스키마 착수 |
| 2026-08-04 | W1 기반 파일 구성 — Next.js/Payload 설정, 11개 컬렉션·Global·검증 훅·Admin/REST 라우트 골격 | 의존성 설치·타입 검증, fixture 시드 |
| 2026-08-04 | 의존성 설치 및 Payload 설정 오류 수정 — ESM 모드·Admin serverFunction·redirects 중복 등록 해결 | PostgreSQL 연결·fixture 시드·Admin 게이트 |
| 2026-08-04 | 프로젝트 전용 Docker PostgreSQL/PostGIS 구성 — `postgis/postgis:16-3.5-alpine`, 호스트 포트 `55432` | Payload dev push·fixture 시드 |
| 2026-08-04 | `point` 필드 요구사항 확인 — 일반 Postgres에서 PostGIS 이미지로 전환, `postgis` 확장 활성화 | `pnpm dev` 스키마 push·fixture 시드 |
| 2026-08-04 | 문서화 체계 구축 — `CLAUDE.md`, `04-progress.md`, `05-decisions.md` 신설 | W1 착수 |
| 2026-08-04 | 스택 전환: NestJS → Payload CMS. `03-tech-spec.md` 전면 재작성. 로드맵 8주→4주 | — |
| 2026-08-04 | 시안 rev.2 반영 — 브랜드 개편, 여행 섹션, 다크모드, 리뷰 타입 5종 다형화 | — |
| 2026-08-04 | 초기 기획 3종 작성 (디자인 시스템·서비스 기획·기술 명세) | — |

---

## 7. 오픈 전 최종 체크리스트

기술이 아니라 **약속을 지켰는지** 확인하는 목록이다.

- [ ] 모든 발행 리뷰에 **단점이 1개 이상** 있는가
- [ ] 모든 `TRIP`에 **총경비와 동선**이 있는가
- [ ] 모든 커버 이미지에 **alt**가 있는가
- [ ] 트러스트 스트립 4지표가 **실제 집계값**인가 (하드코딩 아닌지)
- [ ] 협찬 리뷰가 있다면 **본문 상단에 고지**되는가
- [ ] 제휴 링크에 `rel="sponsored nofollow noopener"`가 붙는가
- [ ] 여행 사진의 **GPS EXIF가 제거**되었는가
- [ ] 집 내부 사진에 주소·차량번호·타인 얼굴이 없는가
- [ ] 뉴스레터 **해지 링크**가 모든 발송에 포함되는가
- [ ] 여행 리뷰 3건 미만이면 `showTravelSection`이 꺼져 있는가
- [ ] 개인정보처리방침·제휴 고지 페이지가 실제 내용으로 채워졌는가
