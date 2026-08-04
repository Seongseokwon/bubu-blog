# 둘의 기준 — 기획 문서

직접 경험한 라이프스타일 리뷰 매거진. `index.html` 시안 **rev.2** 기준.

> **rev.2 반영 완료** (2026-08-04) — 브랜드 개편(살림의 기준 → 둘의 기준),
> 여행 섹션 신설, 다크 모드, 카테고리 재편, 리뷰 타입 5종 다형화

## 문서 구성

> **새 세션은 저장소 루트의 [`CLAUDE.md`](../CLAUDE.md)를 먼저 읽으세요.**
> 프로젝트 개요·스택·현재 위치·작업 규칙이 그 문서에 있습니다.

### 상시 갱신 문서 (진행 관리)

| 문서 | 내용 | 언제 |
|---|---|---|
| [`../CLAUDE.md`](../CLAUDE.md) | 프로젝트 부팅 — 개요·스택·문서맵·함정 | 세션 시작 시 항상 |
| [04-progress.md](./04-progress.md) | **주차별 태스크 체크리스트 · 현재 위치 · 작업 로그** | 작업 시작·종료 시 |
| [05-decisions.md](./05-decisions.md) | 확정 결정(ADR 6건) · **미결정 14건** | 설계 판단 시 |

### 설계 문서 (기준)

| 문서 | 내용 | 주 독자 |
|---|---|---|
| [01-design-system.md](./01-design-system.md) | 컬러/타이포/스페이싱 토큰, **다크 모드**, 컴포넌트 인벤토리, 대비 실측 | 퍼블리싱·FE |
| [02-service-plan.md](./02-service-plan.md) | IA, 사이트맵, 페이지별 기획, 사용자 플로우, 콘텐츠 정책, KPI | 전체 |
| [03-tech-spec.md](./03-tech-spec.md) | 아키텍처, Payload 컬렉션 스키마, 발행 검증, 인증/보안, SEO, 로드맵 | 개발 |
| `../index.html` | **디자인 시안 rev.2 (원본, 수정 금지)** | 퍼블리싱 대조 |

## 확정 사항

- **Next.js 15 (App Router) + Payload CMS 3.x + PostgreSQL** — 단일 앱, 단일 배포
- 콘텐츠 관리: **Payload 어드민** (스키마에서 자동 생성)
- 이미지: **실사진 업로드** (Cloudflare R2, S3 어댑터)
- 인증: **관리자 = 이메일+비밀번호**, **일반회원 = 카카오 로그인(댓글 작성 시)**
- MVP: 리뷰 CRUD/목록/상세 · 뉴스레터 · 댓글/반응 · 제휴링크+애널리틱스
- **[rev.2]** 리뷰 타입 5종 · 여행 도메인 · 다크 모드
- **개발 기간 4주** (NestJS 자체 구현 안 대비 8주 → 4주)

> **스택 변경 이력**: 초기안은 Next.js + NestJS 자체 백엔드였으나,
> 인증·미디어·어드민 UI·권한·드래프트가 전부 Payload 내장 기능과 중복되어 교체.
> 데이터 모델과 발행 검증 규칙 등 **기획 판단은 그대로 유효**합니다. ([기술명세 부록](./03-tech-spec.md))

## 이 프로젝트를 관통하는 7가지 설계 원칙

시안이 말하고 있는 것 = 데이터 모델이 되어야 하는 것.

1. 협찬이 아닌 **직접 경험** → `acquisitionType`
2. 개봉기가 아닌 **누적 경험** → `experienceScale` + `experienceUnit`
3. 점수는 **시간에 따라 변한다** → `ReviewScore` 이력
4. **단점을 먼저** 보여준다 → 목록 카드에서도 단점 노출, 단점 없으면 발행 불가
5. 제품이 아닌 **우리 상황**으로 찾는다 → 상황 태그
6. **다시 할 의향**이 최종 결론 → `wouldRepeat`
7. **[rev.2]** 하나가 아니라 **나란히 놓고 비교** → `COMPARISON` 타입

## ✅ W1 착수 전 결정 완료

스키마·시드에 직접 영향을 주는 4건을 2026-08-04에 확정했습니다.

| ID | 문제 | 결정 |
|---|---|---|
| [D-07](./05-decisions.md) | 카테고리에서 '주방'이 삭제됐는데 카드에는 남아있음 | **확정: `living`에 흡수 + 301** |
| [D-08](./05-decisions.md) | **필터 칩이 여행·숙소·맛집 카드와 매칭되지 않음** | **확정: 태그 계층 분리** |
| [D-09](./05-decisions.md) | `재구매/재방문/재숙박 의사`가 3가지 표현으로 분산 | **확정: `wouldRepeat` 단일 통합** |
| [D-12](./05-decisions.md) | `COMPARISON` 타입 MVP 포함 여부 | **확정: v1.1 연기 (4주 유지)** |

나머지 W2 이후 미결정 10건과 근거는 → [`05-decisions.md`](./05-decisions.md)

### 구현 중 반드시 처리할 시안 결함

발견해둔 것들입니다. 해당 주차 체크리스트([04-progress.md](./04-progress.md))에 반영되어 있습니다.

| 결함 | 주차 | 문서 |
|---|---|---|
| 다크 모드 CTA 흰 텍스트 대비 **2.35:1** (WCAG 실패) | W2 | [디자인 §7.2](./01-design-system.md) |
| 다크 모드 테라코타 태그 대비 **2.09:1** (WCAG 실패) | W2 | [디자인 §7.2](./01-design-system.md) |
| 테마 미저장 · OS 설정 미연동 · FOUC 방지 없음 | W2 | [디자인 §7.3](./01-design-system.md) |
| 다크에서 전환되지 않는 리터럴 색 12곳 | W2 | [디자인 §2](./01-design-system.md) |
| 모바일 2열에 원칙 5개 → 마지막 셀 정렬 깨짐 | W2 | [디자인 §4](./01-design-system.md) |
| 네비(5)/카테고리(6)/푸터(4) 3중 불일치 | W2 | [D-10](./05-decisions.md) |
| 트러스트 스트립 라벨이 물건 기준 문구 | W2 | [D-14](./05-decisions.md) |

## 다음 액션

1. Docker PostgreSQL 실행 후 Payload migration·taxonomy seed ([W1 체크리스트](./04-progress.md))
2. 리뷰 12건 fixture 시드와 발행 검증 테스트 구현
3. **W2부터 리뷰 집필 병행** — 어드민이 W1에 완성되므로 프론트 개발과 동시 진행 가능

## 로컬 PostgreSQL

프로젝트 전용 PostgreSQL/PostGIS는 숙소 위치(`point`) 필드를 지원하기 위해 PostGIS 이미지를 사용하며,
기본 포트 `5432`와 겹치지 않도록 호스트 `55432`를 사용한다.

```powershell
Copy-Item .env.example .env
pnpm db:up
pnpm dev
# 다른 터미널에서
pnpm seed
```

개발 환경에서는 Payload의 Drizzle push가 스키마를 자동 반영하므로 먼저 `pnpm dev`를 실행한다.
S3 업로드 핸들러 import map을 처음 생성하거나 스토리지 설정을 바꾼 뒤에는 `pnpm generate:importmap`을 실행하고 dev 서버를 재시작한다.
배포용 migration이 필요할 때는 `pnpm migrate:create initial-schema` 후 `pnpm migrate`를 사용한다.
상태 확인은 `pnpm db:status`, 로그 확인은 `pnpm db:logs`, 종료는 `pnpm db:down`을 사용한다.
