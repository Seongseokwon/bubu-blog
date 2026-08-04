# 01. 디자인 시스템 명세

> 출처: `index.html` (샘플 시안 rev.2) 전수 분석
> 원칙: **시안의 시각적 결과물을 픽셀 단위로 유지**하되, 하드코딩된 값을 토큰으로 승격시킨다.

> **rev.2 반영 사항** — ① 다크 모드 신설 ② `--color-overlay` 토큰 추가
> ③ 여행 카드(`.travel-*`) 신규 컴포넌트군 ④ 원칙 5열 확대 ⑤ 테마 토글 버튼

---

## 1. 디자인 컨셉 요약

| 항목 | 내용 |
|---|---|
| 무드 | 웜 뉴트럴(warm neutral) · 세이지 그린 · 테라코타 포인트 |
| 인상 | 정돈된 아침 햇살, 광고 아닌 기록, 절제된 신뢰감 |
| 대비 전략 | 배경은 낮은 채도(#faf8f4), 텍스트/CTA만 강한 대비 |
| 모션 | 180ms ease 단일 duration. 이동거리 2~4px의 미세 모션만 사용 |
| 금기 | 채도 높은 원색, 큰 그림자, 과한 애니메이션, 이모지 |
| **테마** | **라이트 기본 + 다크(`body[data-theme="dark"]`). 웜 뉴트럴 → 웜 다크그린 계열로 전환** |

### 1.1 rev.2에서 도입된 시각 언어: "물건 카드" vs "경험 카드"

| | 물건 카드 (`.review-card`) | 경험 카드 (`.travel-card`) |
|---|---|---|
| 배경 | 흰 `surface` + 1px border | 풀블리드 이미지 + 어두운 그라디언트 |
| 텍스트 | `text-strong` / `text-body` | 흰색 (`--color-white`, `rgba(255,255,255,.78)`) |
| 정보 밀도 | 높음 (장단점·별점·업데이트일) | 낮음 (태그·제목·한 줄·별점) |
| 높이 | 콘텐츠 가변 | `min-height: 285px` 고정 |
| 태그 | 솔리드 pill | 반투명 유리 pill (`rgba(255,255,255,.18)` + 1px 보더) |
| 의도 | **판단을 돕는다** | **가고 싶게 만든다** |

이 이원 구조가 rev.2의 핵심이다. 컴포넌트를 하나로 합치려 하지 말 것.

---

## 2. 컬러 토큰

시안의 `:root` 값을 그대로 승격. **값 변경 금지.**

| 토큰명 (CSS var) | Tailwind key | HEX | 용도 |
|---|---|---|---|
| `--color-canvas` | `canvas` | `#faf8f4` | 페이지 기본 배경 |
| `--color-surface` | `surface` | `#ffffff` | 카드 표면 |
| `--color-surface-soft` | `surface-soft` | `#f3f0ea` | 섹션 박스 배경(롱제비티), 중립 태그 배경 |
| `--color-text-strong` | `text-strong` | `#242424` | 제목, 강조 수치 |
| `--color-text-body` | `text-body` | `#4f4b46` | 본문 |
| `--color-text-muted` | `text-muted` | `#7b756d` | 캡션, 보조 설명, 날짜 |
| `--color-primary` | `primary` | `#66725b` | 브랜드 세이지 그린. CTA, 링크, 아이콘 |
| `--color-primary-hover` | `primary-hover` | `#56624d` | primary hover/active |
| `--color-primary-weak` | `primary-weak` | `#e9eee5` | 보조 버튼·카테고리 태그·아이콘 배경 |
| `--color-accent` | `accent` | `#c77d5d` | 테라코타. 별점, 원칙 번호, 뉴스레터 제출 버튼 |
| `--color-accent-weak` | `accent-weak` | `#f5e8e1` | "평가 변경" 태그 배경 |
| `--color-border` | `border` | `#e8e2d9` | 모든 1px 경계선 |
| `--color-success` | `success` | `#52705a` | 장점 라벨, 재구매 의향, 체크 아이콘 |
| `--color-warning` | `warning` | `#a86b45` | 단점 라벨, 검색 0건 안내 |
| `--color-overlay` | `overlay` | `rgba(250,248,244,.85)` | **[rev.2 신규]** sticky 헤더 배경 |

### 2.1 다크 모드 토큰 `body[data-theme="dark"]` **[rev.2 신규]**

동일한 변수명을 재정의하는 방식이므로, **모든 컴포넌트가 `var()`만 참조하면 자동 대응**된다.

| 토큰 | 라이트 | 다크 | 성격 |
|---|---|---|---|
| `--color-canvas` | `#faf8f4` | `#20231f` | 웜 다크그린 |
| `--color-surface` | `#ffffff` | `#292d28` | |
| `--color-surface-soft` | `#f3f0ea` | `#30352f` | |
| `--color-text-strong` | `#242424` | `#f3f0e8` | |
| `--color-text-body` | `#4f4b46` | `#d1cec5` | |
| `--color-text-muted` | `#7b756d` | `#aaa79f` | |
| `--color-primary` | `#66725b` | `#9caf8f` | **명도 반전 — CTA 주의(§7.2)** |
| `--color-primary-hover` | `#56624d` | `#b4c5a7` | |
| `--color-primary-weak` | `#e9eee5` | `#354234` | |
| `--color-accent` | `#c77d5d` | `#d99473` | |
| `--color-accent-weak` | `#f5e8e1` | `#49362e` | |
| `--color-border` | `#e8e2d9` | `#444a42` | |
| `--color-success` | `#52705a` | `#9bc09e` | |
| `--color-warning` | `#a86b45` | `#e1a27d` | |
| `--color-white` | `#ffffff` | `#ffffff` | 변하지 않음 |
| `--color-overlay` | `rgba(250,248,244,.85)` | `rgba(32,35,31,.92)` | |

**개별 오버라이드 (토큰만으로 해결 안 되는 3곳)**

```css
body[data-theme="dark"] .theme-btn .sun-icon  { display: block; }
body[data-theme="dark"] .theme-btn .moon-icon { display: none; }
/* 히어로 사진 그라디언트는 하드코딩이라 다크에서도 밝게 유지됨 → 그 위 요소만 보정 */
body[data-theme="dark"] .floating-label  { color:#f3f0e8; background:rgba(41,45,40,.96);
                                           border-color:#566254; box-shadow:0 12px 24px rgba(0,0,0,.26); }
body[data-theme="dark"] .floating-label svg { color:#b4c5a7; }
body[data-theme="dark"] .photo-caption   { color: rgba(36,36,36,.86); }
```

> `.hero-photo`, `.travel-sapporo` 등 **장식용 그라디언트는 의도적으로 테마 불변**이다.
> 실사진으로 교체되면 이 오버라이드 3줄도 함께 재검토해야 한다.

### 파생 색 (시안에 리터럴로 등장 — 토큰화 필요)

rev.2에서 다크 모드가 생기면서, 아래 리터럴들은 **다크에서 전환되지 않는 실제 버그**가 되었다.
(라이트 전용 값이 어두운 배경 위에 그대로 남는다.)

| 위치 | 값 | 제안 토큰 | 다크 영향 |
|---|---|---|---|
| `.btn-secondary:hover` | `#dfe8da` | `--color-primary-weak-hover` | 🔴 밝은 녹색 블록이 튐 |
| `.btn:disabled` | text `#a39d95` / bg `#ebe7e0` | `--color-text-disabled` / `--color-surface-disabled` | 🔴 |
| `.tag.terracotta` text | `#985a3f` | `--color-accent-strong` | 🔴 대비 2.09:1 (§7.2) |
| `.category-card:hover` bg / border | `#fdfcf9` / `#ccd6c5` | `--color-surface-hover` / `--color-border-primary` | 🔴 hover 시 카드가 하얗게 번쩍임 |
| `.review-card:hover` border | `#cbd5c4` | `--color-border-primary` (통합 권장) | 🔴 |
| `.review-image` bg | `#d8d0c1` | `--color-image-fallback` | 🟡 이미지 로딩 중 |
| `.filter-chip:hover` border | `#b6c4ae` | `--color-border-primary` | 🟡 |
| 뉴스레터 내부 텍스트 | eyebrow `#dce8d5`, 본문 `#e6ece1` | `--color-on-primary-muted` | 🟡 primary 배경도 밝아져 대비 저하 |
| 뉴스레터 폼 메시지 | `#f7e0d4` / `#e6f1dd` / `#ffd5c2` | `--color-on-primary-*` | 🟡 |
| `.newsletter-form .btn:hover` | `#ad684c` | `--color-accent-hover` | 🟡 |
| `.travel-card .tag` / `.rating` | `#f4f1e8` / `#f0bd9f` | 유지 가능 | ⚪ 어두운 오버레이 위 고정이라 무방 |
| `:focus-visible` outline | `rgba(102,114,91,.45)` | `--color-focus-ring` | 🔴 다크에서 포커스 링이 거의 안 보임 |

> ✅ 이미 잘 고쳐진 것 — `.site-footer` 배경이 `#f4f0e9` → `var(--color-surface-soft)`로,
> `.site-header` 배경이 `rgba(250,248,244,.85)` → `var(--color-overlay)`로 승격되었다.
> 나머지 리터럴도 같은 방식으로 전부 승격시키는 것이 이번 rev의 남은 숙제다.

**구현 규칙**: `globals.css`에 리터럴 HEX가 남아 있으면 안 된다.
CI에 간단한 lint 규칙(`:root`/`[data-theme]` 블록 외부의 `#[0-9a-f]{6}` 금지, 그라디언트 예외)을 걸어 회귀를 막는다.

---

## 3. 타이포그래피

### 폰트 스택

```
Pretendard, "Pretendard Variable", -apple-system, BlinkMacSystemFont,
"Segoe UI", "Noto Sans KR", sans-serif
```

- **로딩 방식**: `next/font/local`로 Pretendard Variable(`.woff2`) 서브셋 자체 호스팅.
  CDN(`cdn.jsdelivr.net`) 참조는 LCP 및 개인정보 측면에서 지양.
- `font-display: swap`, `preload: true`, `-webkit-font-smoothing: antialiased`

### 타입 스케일

| 역할 | 크기 | line-height | letter-spacing | weight |
|---|---|---|---|---|
| body (desktop) | 17px | 1.7 | — | 400 |
| body (≤767px) | 16px | 1.7 | — | 400 |
| h1 (hero) | `clamp(2.4rem, 6vw, 4.8rem)` | 1.1 | `-.08em` | 700+ |
| h1 (≤767px) | `clamp(2.5rem, 12vw, 4rem)` | 1.1 | `-.08em` | 700+ |
| h2 (섹션) | `clamp(1.75rem, 3vw, 2.5rem)` | 1.25 | `-.045em` | 700+ |
| h2 (뉴스레터) | `clamp(1.8rem, 3.5vw, 3rem)` | 1.2 | `-.06em` | 700+ |
| 카드 제목 (featured) | `clamp(1.08rem, 2vw, 1.35rem)` | 1.4 | `-.04em` | 700 |
| 카드 제목 (side/sub) | 18px → 16px(mobile) | 1.4 | `-.04em` | 700 |
| eyebrow | 13px | — | `.1em` / uppercase | 800 |
| 본문 소형 (결론문) | 14px | 1.65 | — | 400 |
| 장단점 | 13px | 1.45 | — | 400 / b는 800 |
| 태그 | 12px | 1.3 | — | 800 |
| 캡션·날짜 | 11~12px | — | `.04em`(라벨류) | 700~800 |
| 지표 수치(trust) | 20px | — | `-.04em` | 900 |
| 브랜드 로고 | 상속 | 1.05 | `-.075em` | 900 |
| 브랜드 태그라인(em) | 10px | — | `.04em` | 700 |

> **letter-spacing 음수값이 이 디자인의 핵심 시그니처**다. 제목류에서 절대 제거하지 말 것.

---

## 4. 레이아웃 · 스페이싱

| 항목 | 값 |
|---|---|
| 컨테이너 최대폭 | `1200px` |
| 컨테이너 계산식 (≥1024px) | `width: min(1200px, calc(100% - 64px))` |
| 컨테이너 (768~1023px) | `min(1200px, calc(100% - 48px))` |
| 컨테이너 (≤767px) | `calc(100% - 40px)` |
| 섹션 상단 패딩 | `96px` → `64px`(≤767px) |
| 히어로 패딩 | `82px 0 56px` → `57px 0 42px`(≤767px) |
| 뉴스레터 섹션 | `96px 0` → `64px 0` |
| 푸터 | `52px 0 30px` |
| 헤더 높이 | `74px` → `68px`(≤767px), `position: sticky` |
| 그리드 gap | 카드 18px / 카테고리 12px / 롱제비티 12px / 칩 8px |

### 브레이크포인트

| 이름 | 조건 | 주요 변화 |
|---|---|---|
| desktop | ≥1024px | 기본 (카테고리 6열, 최신 3열, **원칙 5열**, 여행 `1.15/.85/.85`) |
| tablet | ≤1023px | 카테고리 3열, feature-grid 1열, feature-side 2열, 롱제비티 1열, 여행 `1.1/.9/.9` |
| mobile | ≤767px | 햄버거 메뉴, 카테고리 2열, 최신 1열, **원칙 2열**, trust 2열, 뉴스레터 1열, 여행 1열 |

> ⚠️ **rev.2 회귀 위험**: 원칙이 4개 → 5개가 되면서 데스크톱은 `repeat(5, 1fr)`로 갱신됐지만,
> 모바일(`≤767px`)은 여전히 `1fr 1fr` 2열이다. 5개를 2열에 넣으면 **마지막 1개가 홀로 남는다.**
> `.principle:nth-child(2) { border-right: 0 }` 규칙도 4개 기준이라 5번째 셀의 우측 보더 처리가 어긋난다.
> → 모바일에서 5번째 항목이 전체 폭을 차지하도록 `.principle:last-child:nth-child(odd) { grid-column: 1 / -1 }` 추가 필요.

**여행 섹션 패딩**: `padding-top: 96px` → `64px`(≤767px). 다른 `.section`과 동일.

---

## 5. 라디우스 · 그림자 · 모션

| 토큰 | 값 | 적용처 |
|---|---|---|
| `--radius-sm` | `10px` | 아이콘 버튼, 썸네일, 플로팅 라벨 |
| `--radius-md` | `16px` | 카드, 검색박스, 롱제비티 카드 |
| `--radius-lg` | `24px` | 롱제비티 래퍼, 뉴스레터 박스 |
| (리터럴) | `11px` / `12px` / `18px` / `999px` | 카테고리 아이콘 / 버튼 / 히어로 사진 / pill |
| `--shadow-soft` | `0 16px 40px rgba(65,55,43,.08)` | 카드 hover |
| `--shadow-float` | `0 22px 50px rgba(65,55,43,.14)` | 히어로 사진, 검색 모달 |
| `--ease` | `180ms ease` | 전 transition |

### 모션 규칙
- 카드 hover: `translateY(-2px ~ -3px)` + border 색 변화 + soft shadow
- 화살표 아이콘 hover: `translateX(3~4px)`
- 버튼 active: `translateY(1px)`
- 네비 언더라인: `scaleX(0→1)`, origin right→left 전환
- `prefers-reduced-motion: reduce` 시 모든 transition/animation `.01ms`로 무력화 — **필수 유지**

---

## 6. 컴포넌트 인벤토리

Next.js 구현 시 아래 단위로 컴포넌트를 분해한다.

### 6.1 Primitives (`components/ui/`)

| 컴포넌트 | Props | 비고 |
|---|---|---|
| `Button` | `variant: primary \| secondary \| text`, `size`, `disabled`, `asChild` | min-height 48px, radius 12px, weight 800 |
| `Tag` | `variant: primary \| terracotta \| neutral` | pill, 12px/800 |
| `Rating` | `score: number`, `max=5` | `<strong>4.3</strong> / 5`, accent 컬러 |
| `Eyebrow` | `children` | `::before` 24px 라인 포함 |
| `SectionHeading` | `eyebrow`, `title`, `description?`, `action?` | 우측 링크 or 설명문 배치 |
| `TextLink` | `href`, `children` | 화살표 아이콘 슬라이드 |
| `IconButton` | `label`(필수, a11y), `children` | 40×40 |
| `FilterChip` | `active`, `onClick`, `aria-pressed` | |
| `SkipLink` | — | 접근성 필수 |
| `ThemeToggle` | — | **[rev.2]** sun/moon 아이콘 스왑, `aria-pressed` + `aria-label` 동적 갱신 |
| `DetailLink` | `href` | **[rev.2]** CSS만 존재하고 HTML 미사용 → 카드 하단 "자세히 보기" 용도로 상세 페이지 도입 시 활용 |

### 6.2 Layout (`components/layout/`)

| 컴포넌트 | 설명 |
|---|---|
| `SiteHeader` | sticky, scroll>12px 시 `.scrolled` (border + blur + bg 불투명도 상승) |
| `PrimaryNav` | 데스크톱 인라인 / 모바일 풀스크린 드롭다운. `aria-current="page"` |
| `MobileMenuToggle` | `aria-expanded`, `aria-controls`, body scroll lock |
| `SearchDialog` | `role="dialog" aria-modal`, ESC 닫기, 오버레이 클릭 닫기, 포커스 트랩(**시안에 없음 → 추가 필요**) |
| `SiteFooter` | 4열 → 2열, 제휴 고지문 포함 |
| `ScrollTopButton` | scroll>520px 시 표시 |
| `Container` | 반응형 폭 계산 |

### 6.3 Domain (`components/review/`, `components/home/`)

| 컴포넌트 | 설명 |
|---|---|
| `ReviewCard` | `variant: featured \| horizontal \| default`. 이미지 + 메타태그 + 제목 + 한줄결론 + 장단점 1쌍 + 별점 + 업데이트일 |
| `ReviewImage` | 실사진(next/image) + blur placeholder. 이미지 부재 시 CSS 아트 fallback |
| `ProsCons` | pros/cons 각 1줄. `<b>` flex-basis 30px 고정 |
| `CategoryCard` | 아이콘 + 이름 + 설명 + "N개의 리뷰" |
| `TrustStrip` | dl/dt/dd 4지표 |
| `LongevityCard` | 썸네일 76px + 제품명 + 사용기간 + `처음 X → 현재 Y` + 재구매 배지 |
| `SituationFilter` | 칩 목록 + `aria-live` 상태 문구 + no-results |
| `PrincipleList` | 번호 + 제목 + 설명 **5개** (정적). rev.2에서 "광고보다 경험 우선" 추가 |
| `TravelSection` | **[rev.2]** `.travel-intro`(2열 인트로) + `.travel-grid` |
| `TravelCard` | **[rev.2]** 풀블리드 배경 + 어두운 그라디언트 + 흰 텍스트. `variant: trip \| stay \| compare` |
| `NewsletterBox` | primary 배경 + 인라인 폼 + `aria-live` 메시지 |
| `HeroVisual` | 히어로 사진 + 플로팅 라벨 3개 |

### 6.4 이미지 아트 클래스 (마이그레이션 전략)

시안은 `.art-dishwasher`, `.art-mattress`, `.art-food`, `.art-sofa`, `.art-pan`, `.art-laundry`, `.art-suitcase` 등 **CSS 그라디언트 플레이스홀더**를 사용한다.

- 실사진 업로드로 전환하므로 **본 서비스에서는 실사진이 1순위**.
- 단, `coverImage`가 없는 초안/마이그레이션 중 리뷰를 위해 카테고리별 CSS 아트를 **fallback 컴포넌트로 보존**한다.
  → `<ReviewImage src={...} fallbackArt="pan" />`
- 이 CSS는 `styles/placeholder-art.css`로 분리하여 유지.

### 6.5 종횡비 규칙

| 위치 | ratio |
|---|---|
| 기본 카드 이미지 | `16 / 10` |
| featured 카드 | `4 / 3` |
| feature-side (가로형, ≥1024px & ≤767px) | 부모 높이 채움 (`height: 100%`) |
| 롱제비티 썸네일 | `1 / 1` (76px, 태블릿 86px, 모바일 70px) |
| 여행 카드 | ratio 없음 — `min-height: 285px` (모바일 220px) 고정 |

### 6.6 여행 카드 스펙 **[rev.2 신규]**

```
.travel-grid   grid-template-columns: 1.15fr .85fr .85fr   (≥1024px)
                                      1.1fr  .9fr  .9fr    (≤1023px)
                                      1fr                  (≤767px)
               gap: 14px → 9px(모바일)
.travel-card   min-height 285px(220px) · padding 22px · radius-md
               flex-column · justify-content: end   ← 콘텐츠 하단 정렬
.travel-card::before  linear-gradient(180deg, transparent 25%, rgba(28,31,26,.72))
.travel-card > *      position: relative; z-index: 1   ← 오버레이 위로 올림
  h3      24px / 1.2 / -.05em / white / max-width 300px
  p       13px / rgba(255,255,255,.78)
  .tag    유리 pill: color #f4f1e8, bg rgba(255,255,255,.18), border rgba(255,255,255,.22)
  .rating margin-top 13px, color #f0bd9f
```

**배경 그라디언트 (실사진 전환 전 임시)**

| 클래스 | 그라디언트 |
|---|---|
| `.travel-sapporo` | `135deg, #7d887b, #c5b59d 55%, #5f726d` |
| `.travel-hotel` | `140deg, #8b6e5c, #c7ae92 55%, #56695e` |
| `.travel-onsen` | `135deg, #7c8f82, #b99d7b 55%, #5d716c` |

> 실사진으로 교체 시 **`::before` 그라디언트 오버레이는 반드시 유지**할 것.
> 사진 밝기가 제각각이라 오버레이 없이는 흰 텍스트 대비가 보장되지 않는다.
> 권장: 오버레이를 `rgba(28,31,26,.72)` → `.78`로 살짝 올리고, 텍스트 영역에 한정한 추가 스크림 적용.

**현재 오버레이 기준 대비 실측** (합성 배경 근사 `#4a4d47`)

| 요소 | 대비 | 판정 |
|---|---|---|
| `h3` 흰색 | 8.59:1 | ✅ |
| `p` `rgba(255,255,255,.78)` | 5.17:1 | ✅ |
| `.rating` `#f0bd9f` | 5.11:1 | ✅ |

> 단, 이는 **현재의 어두운 그라디언트 기준**이다. 밝은 실사진(설경·흰 벽 호텔)으로 바꾸면 즉시 깨진다.
> 업로드 파이프라인에서 **커버 하단 40% 영역의 평균 휘도를 계산해 임계값 초과 시 어드민에서 경고**하는 검증을 넣는 것을 권장한다.

---

## 7. 접근성 체크리스트 (시안 준수 + 보강)

시안이 이미 지키고 있는 것 — **반드시 유지**:

- `.skip-link` 본문 바로가기
- `:focus-visible` 3px 아웃라인 (`rgba(102,114,91,.45)`, offset 4px)
- `.sr-only` 유틸리티
- 모든 `<svg>`에 `aria-hidden="true"`
- 아이콘 전용 버튼에 `aria-label`
- `aria-expanded` / `aria-controls` / `aria-pressed` / `aria-current`
- `aria-live="polite"` (필터 상태, 폼 메시지)
- `role="img"` + `aria-label` (CSS 아트 플레이스홀더)
- `prefers-reduced-motion` 대응

**MVP에서 보강할 것**:

1. 검색 다이얼로그 **포커스 트랩** 및 닫힘 시 트리거로 포커스 복귀 (현재 복귀만 구현)
2. 모바일 메뉴 열림 시 배경 콘텐츠 `inert` 처리
3. 카드 전체가 `<a>`인 구조 → 카드 내부에 별도 링크(제휴 링크 등)를 넣을 수 없음.
   → **제목만 링크 + 카드 전체는 `::after` 확장 클릭 영역** 패턴으로 변경 권장
4. 폼 에러 시 `aria-invalid` + `aria-describedby` 연결 (시안 구현됨, 유지)

### 7.1 색 대비 실측 (WCAG 2.1)

| 조합 | 대비 | 판정 | 조치 |
|---|---|---|---|
| `text-strong #242424` on canvas | 14.63:1 | AA/AAA ✅ | — |
| `text-body #4f4b46` on canvas | 8.16:1 | AA/AAA ✅ | — |
| `primary #66725b` on canvas | 4.80:1 | AA ✅ | — |
| white on `primary` (CTA) | 5.09:1 | AA ✅ | — |
| `primary-hover` on `primary-weak` (보조 버튼) | 5.49:1 | AA ✅ | — |
| `#985a3f` on `accent-weak` (평가변경 태그) | 4.53:1 | AA ✅ | — |
| `success #52705a` on surface | 5.49:1 | AA ✅ | — |
| **`text-muted #7b756d` on canvas** | **4.30:1** | ⚠️ **AA 미달** | 아래 조치 |
| **`accent #c77d5d` on canvas** | **3.04:1** | ⚠️ **AA 미달** | 아래 조치 |
| **`warning #a86b45` on surface** | **4.33:1** | ⚠️ **AA 미달** | 아래 조치 |

> WCAG AA 일반 텍스트 기준은 4.5:1이며, "큰 텍스트"(18.66px 이상 굵게 또는 24px 이상)만 3:1이 허용된다.
> 위 3개 조합은 모두 **11~14px**에서 사용되므로 예외가 적용되지 않는다.

**권장 조치 — 시각적 인상을 해치지 않는 최소 보정:**

| 토큰 | 현재 | 보정안 | 대비 |
|---|---|---|---|
| `--color-text-muted` | `#7b756d` | `#736d64` | 4.75:1 ✅ |
| `--color-accent` (텍스트용) | `#c77d5d` | 텍스트에는 `--color-accent-strong #a8613f` 사용 (4.53:1). 배경/장식은 `#c77d5d` 유지 | ✅ |
| `--color-warning` | `#a86b45` | `#9a5f3c` | 5.03:1 ✅ |

- 별점(`.rating`)의 `strong`은 이미 `text-strong`이므로 숫자는 안전. **"/ 5" 부분만** accent → accent-strong으로 교체하면 된다.
- 이 보정은 육안으로 거의 구별되지 않으면서 접근성 감사(axe, Lighthouse 100점)를 통과시킨다.
- 반영을 원치 않는 경우, 최소한 **캡션/날짜(11~12px)에는 `text-muted` 대신 `text-body` 사용**으로 대체할 것.

### 7.2 다크 모드 색 대비 실측 **[rev.2]**

다크 팔레트는 **본문 계열이 오히려 라이트보다 우수**하다. 다만 치명적 실패가 2건 있다.

| 조합 | 대비 | 판정 |
|---|---|---|
| `text-strong #f3f0e8` on canvas `#20231f` | 13.95:1 | ✅ |
| `text-body #d1cec5` on canvas | 10.10:1 | ✅ |
| `text-muted #aaa79f` on canvas | 6.61:1 | ✅ (라이트보다 양호) |
| `primary #9caf8f` on canvas | 6.77:1 | ✅ |
| `accent #d99473` on canvas | 6.38:1 | ✅ |
| `primary-hover` on `primary-weak` (보조 버튼) | 5.80:1 | ✅ |
| `success #9bc09e` on surface | 6.95:1 | ✅ |
| `warning #e1a27d` on surface | 6.44:1 | ✅ |
| `text-muted` on `surface-soft` (중립 태그) | 5.82:1 | ✅ |
| 🔴 **white on `primary` (`.btn-primary`, 뉴스레터 박스)** | **2.35:1** | ❌ **심각** |
| 🔴 **`.tag.terracotta` `#985a3f` on `accent-weak #49362e`** | **2.09:1** | ❌ **심각** |

**원인과 해결**

**① CTA 텍스트 — 구조적 문제**

`.btn-primary`는 `color: var(--color-white)`로 고정되어 있는데, 다크에서 `--color-primary`가 `#66725b`(어두운 세이지) → `#9caf8f`(밝은 세이지)로 **명도가 반전**된다. 밝은 배경 위 흰 글씨가 되어버린다. 같은 문제가 `.newsletter-box`(배경 `var(--color-primary)` + 흰 제목)에도 그대로 있다.

→ **`--color-on-primary` 토큰 신설**이 정답이다. `--color-white`를 직접 쓰지 말 것.

```css
:root                    { --color-on-primary: #ffffff; }  /* 5.09:1 ✅ */
body[data-theme="dark"]  { --color-on-primary: #1b1f1a; }  /* 7.11:1 ✅ */

.btn-primary      { color: var(--color-on-primary); background: var(--color-primary); }
.newsletter-box h2{ color: var(--color-on-primary); }
.skip-link        { color: var(--color-on-primary); }
.top-btn          { color: var(--color-on-primary); }
.filter-chip.is-active { color: var(--color-on-primary); }
```

뉴스레터 박스 내부의 `#dce8d5` / `#e6ece1` 계열도 `--color-on-primary-muted`로 함께 묶어 전환한다.

**② 테라코타 태그 — 리터럴 누락**

`.tag.terracotta`의 `color: #985a3f`만 리터럴로 남아 있고 배경(`--color-accent-weak`)만 다크로 전환되어, 어두운 갈색 위 어두운 갈색이 된다. **라이트에서는 4.53:1로 문제없으므로, 다크 값만 추가하면 된다.**

```css
:root                   { --color-tag-accent: #985a3f; }  /* on #f5e8e1 → 4.53:1 ✅ */
body[data-theme="dark"] { --color-tag-accent: #e0a486; }  /* on #49362e → 5.31:1 ✅ */
.tag.terracotta { color: var(--color-tag-accent); background: var(--color-accent-weak); }
```

> ⚠️ §7.1의 `--color-accent-strong #a8613f`(캔버스 위 텍스트용)와 **혼용하지 말 것.**
> `#a8613f`를 `accent-weak` 배경에 쓰면 3.94:1로 오히려 떨어진다. 두 토큰은 배경이 다르므로 분리해서 관리한다.

**③ 포커스 링**

`:focus-visible { outline: 3px solid rgba(102,114,91,.45) }`가 리터럴이라 다크 배경에서 거의 보이지 않는다.

```css
:root                   { --color-focus-ring: rgba(102,114,91,.45); }
body[data-theme="dark"] { --color-focus-ring: rgba(180,197,167,.65); }
:focus-visible { outline: 3px solid var(--color-focus-ring); outline-offset: 4px; }
```

### 7.3 테마 토글 구현 요구사항 **[rev.2]**

시안의 JS는 동작하지만 **3가지가 빠져 있다.** 실제 구현에서는 반드시 채운다.

```js
// 시안 현재 구현 — 새로고침하면 라이트로 돌아감
themeToggle.addEventListener('click', function () {
  const dark = body.dataset.theme !== 'dark';
  body.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? '라이트 모드로 전환' : '다크 모드로 전환');
});
```

| 누락 | 요구사항 |
|---|---|
| **① 영속성** | `localStorage['theme']`에 저장하고 재방문 시 복원 |
| **② OS 설정 연동** | 저장값이 없으면 `prefers-color-scheme: dark`를 초깃값으로. 이후 사용자가 명시 선택하면 그 값이 우선 |
| **③ FOUC 방지** | Next.js에서 `<head>`에 **blocking inline script**를 넣어 hydration 전에 `data-theme`을 확정. 없으면 다크 사용자에게 흰 화면이 번쩍인다 |

```tsx
// app/layout.tsx — <head> 최상단, next/script 아닌 순수 inline
<script dangerouslySetInnerHTML={{ __html: `
  (function(){
    try {
      var s = localStorage.getItem('theme');
      var d = s ? s === 'dark'
                : window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.dataset.theme = d ? 'dark' : 'light';
    } catch(e) {}
  })();
`}} />
```

> `<body>`에 속성을 붙이므로 스크립트는 body 열림 직후에 두거나, `<html>`로 타깃을 옮기고 CSS 셀렉터도 `html[data-theme="dark"]`로 통일한다. **후자를 권장** — `<head>`에서 실행 가능해 FOUC 창이 더 짧다.

**접근성**
- 토글은 `aria-pressed`로 상태를 노출 (시안 구현됨 ✅)
- `aria-label`을 "다크 모드로 전환" ↔ "라이트 모드로 전환"으로 갱신 (시안 구현됨 ✅)
- 테마 전환 시 `transition`이 걸리면 색이 출렁이므로, 전환 순간에만 `.theme-transition-off` 클래스로 transition을 끄는 처리 권장

---

## 8. Tailwind 설정 방향

```ts
// tailwind.config.ts (발췌)
theme: {
  extend: {
    colors: {
      canvas: 'var(--color-canvas)',
      surface: { DEFAULT: 'var(--color-surface)', soft: 'var(--color-surface-soft)' },
      content: {
        strong: 'var(--color-text-strong)',
        body:   'var(--color-text-body)',
        muted:  'var(--color-text-muted)',
      },
      primary: {
        DEFAULT: 'var(--color-primary)',
        hover:   'var(--color-primary-hover)',
        weak:    'var(--color-primary-weak)',
      },
      accent: { DEFAULT: 'var(--color-accent)', weak: 'var(--color-accent-weak)' },
      line: 'var(--color-border)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      overlay: 'var(--color-overlay)',          // rev.2
      'on-primary': 'var(--color-on-primary)',  // rev.2 — 다크 CTA 필수
    },
    borderRadius: { sm: '10px', md: '16px', lg: '24px' },
    boxShadow: { soft: 'var(--shadow-soft)', float: 'var(--shadow-float)' },
    transitionDuration: { DEFAULT: '180ms' },
    maxWidth: { container: '1200px' },
    screens: { md: '768px', lg: '1024px' },  // 시안 기준(1023/767)과 정렬
  }
}
```

- 색 정의는 **반드시 CSS 변수 참조**로. `globals.css`의 `:root`와 `[data-theme="dark"]`에만 실제 HEX를 둔다.
- 이 방식이면 다크 모드에 Tailwind `dark:` 배리언트가 **거의 필요 없다.** 변수만 갈아끼우면 끝.
  (`dark:`가 필요한 곳은 아이콘 스왑·그림자 강도 등 극소수)
- `darkMode: ['selector', '[data-theme="dark"]']`로 설정해 잔여 케이스를 커버한다.
- `clamp()` 타입 스케일은 Tailwind 유틸로 억지 변환하지 말고 `@layer components`의 `.text-display`, `.text-section` 등으로 정의.

---

## 9. rev.2 변경 요약 (체크리스트)

| 구분 | 변경 | 조치 |
|---|---|---|
| 🆕 | 다크 모드 토큰 16종 | §2.1 |
| 🆕 | `--color-overlay` (헤더 배경) | §2 |
| 🆕 | `.theme-btn` 토글 + sun/moon 스왑 | §6.1, §7.3 |
| 🆕 | `.travel-*` 컴포넌트군 (섹션·인트로·그리드·카드 3종) | §6.3, §6.6 |
| 🆕 | `.detail-link` (CSS만, HTML 미사용) | §6.1 |
| 🔧 | `.site-footer` 배경 리터럴 → `var(--color-surface-soft)` ✅ | — |
| 🔧 | `.site-header` 배경 → `var(--color-overlay)` ✅ | — |
| 🔧 | `.principles` 4열 → **5열** | §4 |
| 🔴 | 다크 CTA 흰 텍스트 2.35:1 | §7.2 ① |
| 🔴 | 다크 테라코타 태그 2.09:1 | §7.2 ② |
| 🔴 | 다크 포커스 링 미대응 | §7.2 ③ |
| 🔴 | 테마 영속성/OS연동/FOUC 미구현 | §7.3 |
| 🟡 | 모바일 2열에 원칙 5개 → 마지막 셀 정렬 깨짐 | §4 |
| 🟡 | 다크 전환 안 되는 리터럴 12곳 잔존 | §2 파생색 표 |
