# CLAUDE.md

> **새 세션은 이 문서를 먼저 읽는다.**
> 여기에는 "무엇을 만드는가"와 "지금 어디인가"만 둔다. 상세는 `docs/`로 링크한다.
> 최종 갱신: 2026-08-04

---

## 1. 프로젝트

**둘의 기준** (`OUR EVERYDAY STANDARD`) — 부부가 직접 사고, 직접 예약하고, 직접 다녀온 것들의
장단점을 시간이 지난 뒤 다시 평가해 기록하는 **라이프스타일 리뷰 매거진**.

- 수익 모델: 제휴 링크 + 뉴스레터
- 핵심 유입: 검색(롱테일 키워드) → **SEO가 최우선 비기능 요구사항**
- 운영자: 부부 2인 (관리자 계정 2개)

### 서비스를 지탱하는 7가지 원칙

이게 곧 데이터 모델이다. 기능을 추가·변경할 때 이 목록과 충돌하는지 먼저 본다.

| # | 원칙 | 구현 |
|---|---|---|
| 1 | 협찬이 아닌 **직접 경험** | `acquisitionType` |
| 2 | 개봉기가 아닌 **누적 경험** | `experienceScale` + `experienceUnit` |
| 3 | 점수는 **시간에 따라 변한다** | `scores[]` 재평가 이력 |
| 4 | **단점을 먼저** 보여준다 | 목록 카드에도 단점 노출, **단점 없으면 발행 불가** |
| 5 | 제품이 아닌 **우리 상황**으로 찾는다 | 상황 태그 필터 |
| 6 | **다시 할 의향**이 최종 결론 | `wouldRepeat` |
| 7 | 하나가 아니라 **나란히 비교** | `COMPARISON` 타입 |

---

## 2. 스택 (확정)

```
Next.js 15 (App Router) + Payload CMS 3.86.x + PostgreSQL
단일 앱 · 단일 배포 · 별도 백엔드 없음
```

| 영역 | 선택 |
|---|---|
| CMS | Payload 3.86.x (**전 패키지 버전 동일 고정**) |
| DB | PostgreSQL (`@payloadcms/db-postgres`) |
| 에디터 | Lexical |
| 스타일 | Tailwind v4 + CSS 변수 |
| 스토리지 | Cloudflare R2 (S3 어댑터, `region: 'auto'`) |
| 메일 | Resend |
| 캐시/RL | Redis (Upstash) |
| 배포 | Vercel 또는 Railway (상시 구동형 권장) |

> **스택 변경 이력**: 초기안은 Next.js + NestJS 자체 백엔드(8주)였으나,
> 인증·미디어·어드민 UI·권한·드래프트가 Payload 내장 기능과 전부 중복되어 교체 → **4주**.
> 근거: [`docs/05-decisions.md` ADR-001](docs/05-decisions.md)

---

## 3. 문서 지도

| 문서 | 내용 | 언제 읽나 |
|---|---|---|
| **`CLAUDE.md`** (이 문서) | 프로젝트 개요·스택·현재 위치 | 세션 시작 시 항상 |
| [`docs/04-progress.md`](docs/04-progress.md) | **주차별 태스크 체크리스트 · 현재 위치** | 작업 시작·종료 시 |
| [`docs/05-decisions.md`](docs/05-decisions.md) | 확정 결정(ADR) · **미결정 14건** | 설계 판단이 필요할 때 |
| [`docs/01-design-system.md`](docs/01-design-system.md) | 토큰·다크모드·컴포넌트·접근성 대비 | 퍼블리싱 시 |
| [`docs/02-service-plan.md`](docs/02-service-plan.md) | IA·페이지 기획·콘텐츠 정책·KPI | 화면 설계 시 |
| [`docs/03-tech-spec.md`](docs/03-tech-spec.md) | 컬렉션 스키마·발행검증·인증·SEO | 구현 시 |
| `index.html` | **디자인 시안 rev.2 (원본, 수정 금지)** | 퍼블리싱 대조 |

---

## 4. 현재 위치

```
[■] 기획·설계   완료
[□] W1 구현     미착수  ← 다음
[□] W2 구현
[□] W3 구현
[□] W4 구현
```

**코드는 아직 한 줄도 없다.** 저장소에는 시안(`index.html`)과 문서(`docs/`)만 있다.

세부 진행 상황과 다음 할 일은 → [`docs/04-progress.md`](docs/04-progress.md)

---

## 5. 작업 규칙

### 5.1 시안 (`index.html`)

- **원본이며 수정하지 않는다.** 구현의 정답지로만 쓴다.
- 색·간격·letter-spacing은 시안 값을 그대로 옮긴다. 특히 **제목의 음수 letter-spacing은 이 디자인의 시그니처**이므로 제거 금지.
- 시안에 없는 화면(리뷰 상세 등)은 `docs/02-service-plan.md` §3의 설계를 따른다.

### 5.2 색

- `globals.css`의 `:root` / `[data-theme="dark"]` **밖에 리터럴 HEX가 있으면 안 된다.**
- 컴포넌트는 `var(--color-*)`만 참조한다. 그래야 다크 모드가 자동으로 따라온다.
- 시안에는 아직 리터럴 12곳이 남아 있다. 옮길 때 전부 토큰으로 승격시킨다.

### 5.3 표시 문자열

- `"직접 구매"`, `"3박 숙박"`, `"다시 갈 의향 있음"` 같은 문자열을 **DB에 저장하지 않는다.**
- `src/lib/labels.ts`의 매핑에서 파생시킨다. (`docs/03-tech-spec.md` §2.5)

### 5.4 발행 검증

- `src/collections/Reviews/hooks/validatePublish.ts`가 **기획의 약속을 지키는 방어선**이다.
- 여기 규칙을 완화하려면 먼저 `docs/05-decisions.md`에 근거를 남긴다.
- 특히 **단점 최소 1개**와 **TRIP 총경비 필수**는 서비스 정체성이므로 임의로 풀지 않는다.

### 5.5 문서 갱신

작업을 마치면 **반드시** `docs/04-progress.md`의 체크박스와 "현재 위치"를 갱신한다.
설계 판단을 내렸으면 `docs/05-decisions.md`에 ADR을 추가한다.
이 두 가지가 다음 세션의 유일한 인수인계 수단이다.

---

## 6. 착수 전 반드시 확인할 것

`docs/05-decisions.md`에 **미결정 14건**이 있다. 이 중 아래 4건은 W1 스키마에 직접 영향을 준다.

| # | 이슈 | 영향 |
|---|---|---|
| D-07 | '주방' 카테고리 삭제 처리 | `categories` 시드 데이터 |
| D-08 | 필터 칩 ↔ 여행 카드 불일치 (태그 2계층 분리) | `tags` 스키마·시드 |
| D-09 | `재구매/재방문/재숙박` 3중 표현 통합 | `wouldRepeat` 라벨 |
| D-12 | `COMPARISON` MVP 포함 여부 | 로드맵 4주 유지 여부 |

**이게 정해지지 않은 상태로 W1을 시작하면 스키마를 다시 짜게 된다.**

---

## 7. 자주 틀리는 지점

| 함정 | 올바른 방법 |
|---|---|
| Payload 패키지 버전 불일치 | 공식 패키지는 **동기 배포**. `payload`, `@payloadcms/*` 전부 같은 버전 |
| R2 `region` 설정 | AWS 리전이 아니라 **`'auto'`** |
| `beforeValidate`의 `data` | 변경된 필드만 담긴 **delta**. `originalDoc`과 병합해서 검사할 것 |
| blur placeholder | Payload가 **안 만들어준다.** `media`의 `beforeChange`에서 직접 생성 |
| 다크모드 CTA | `--color-white` 직접 사용 금지. **`--color-on-primary`** 사용 (다크에서 2.35:1 실패) |
| 카드 전체 `<a>` | 중첩 링크 문제. **제목만 링크 + `::after` 확장 클릭영역** |
| 소셜 로그인 계정 | 임의 비밀번호를 쓰므로 **로컬 로그인 경로 차단** 필요 |
