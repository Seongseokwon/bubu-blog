# 03. 기술 명세서 — 둘의 기준 (Payload CMS 기준)

> **Next.js 15 (App Router) + Payload CMS 3.x + PostgreSQL**
> 시안 rev.2 반영 — 다형 리뷰 타입, 다크 모드, 여행 도메인
> 스택 변경: ~~NestJS 별도 백엔드~~ → **Payload (단일 Next.js 앱)**

---

## 0. 왜 Payload인가

### 0.1 NestJS 안(案) 대비 사라지는 작업

기존 8주 로드맵에서 **차별화에 기여하지 않는 6주치**가 대부분 제거된다.

| 작업 | NestJS 안 | Payload |
|---|---|---|
| 인증 (JWT/refresh/쿠키/세션) | 직접 구현 (~4일) | ✅ 내장 |
| 소셜 로그인 | 직접 구현 (~2일) | ✅ 플러그인 |
| 어드민 CRUD UI | 직접 구현 (~10일) | ✅ 스키마에서 자동 생성 |
| 미디어 업로드·리사이즈·포커스 | presign + sharp 직접 (~3일) | ✅ 내장 (`upload` 컬렉션) |
| 접근 제어 (역할별 권한) | 가드 직접 (~2일) | ✅ 컬렉션별 `access` |
| 드래프트 / 버전 / 프리뷰 | 직접 구현 (~3일) | ✅ `versions.drafts` |
| 댓글·구독자 관리 화면 | 직접 구현 (~3일) | ✅ 컬렉션으로 자동 |
| DTO ↔ 타입 동기화 | `packages/types` 수동 | ✅ `payload-types.ts` 자동 생성 |
| REST/GraphQL API | 직접 작성 | ✅ 자동 노출 |
| DB 마이그레이션 | Prisma 별도 | ✅ 내장 (`payload migrate`) |

**남는 것 = 실제로 우리 것인 부분**: 디자인 구현, 발행 검증 규칙, 여행 도메인 UI, SEO, 다크 모드.

### 0.2 결정적 이점 — Local API

Payload는 HTTP 계층 없이 **서버 컴포넌트에서 DB를 직접 조회**한다.

```tsx
// app/(site)/page.tsx — RSC. fetch도, API 라우트도, 네트워크 홉도 없음
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function Home() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'reviews',
    where: { _status: { equals: 'published' } },
    limit: 6,
    sort: '-publishedAt',
  })
  return <ReviewGrid items={docs} />
}
```

NestJS 안에서는 `Next → HTTP → Nest → DB` 3홉이었다. Payload는 **1홉**이다.
TTFB가 줄고, 별도 백엔드 배포·CORS·BFF 프록시가 전부 사라진다.

### 0.3 리스크 평가

| 리스크 | 평가 |
|---|---|
| **Figma 인수 (2025.06)** | MIT 라이선스·GitHub 저장소 유지, 팀 전원 합류 후 개발 지속. v3는 계속 릴리스 중(3.86.0, 2026.07) |
| **v4 출시 예정** | 관리자 UI·디자인 시스템 개편 중. **v3에서 시작하고 v4는 안정화 후 이전** 권장 |
| 락인 | 데이터는 우리 Postgres에. 최악의 경우 SQL 그대로 들고 나갈 수 있음 |
| 러닝커브 | 필드 스키마 문법 학습 1~2일. NestJS 모듈 구조 학습보다 짧음 |
| 커스텀 UI 한계 | 어드민이 React라 필요 시 커스텀 컴포넌트 주입 가능 |

> ⚠️ **버전 고정 필수**: Payload 공식 패키지는 버전 번호가 동기 배포된다.
> `payload`, `@payloadcms/next`, `@payloadcms/db-postgres` 등을 **전부 동일 버전으로 고정**해야 한다.

---

## 1. 아키텍처

```
                    ┌─────────────────────────────────────┐
    사용자  ──────▶ │  Next.js 15 App Router              │
                    │  ┌───────────────────────────────┐  │
                    │  │ app/(site)/    공개 페이지     │  │ ← RSC + ISR
                    │  │   └ Local API 직접 호출        │  │
                    │  ├───────────────────────────────┤  │
                    │  │ app/(payload)/admin  어드민    │  │ ← Payload 자동 생성
                    │  │ app/(payload)/api    REST/GQL  │  │
                    │  └───────────────────────────────┘  │
                    └──────────┬────────────┬─────────────┘
                               │            │
                    ┌──────────▼──┐   ┌─────▼─────────┐
                    │ PostgreSQL  │   │ Cloudflare R2 │
                    │ (Drizzle)   │   │ (S3 어댑터)   │
                    └──────────┬──┘   └───────────────┘
                               │
                    ┌──────────▼──┐   ┌───────────────┐
                    │ Redis       │   │ Resend        │
                    │ (조회수/RL) │   │ (메일)        │
                    └─────────────┘   └───────────────┘
```

**단일 배포 단위.** 프론트와 백엔드가 한 앱이다.

### 1.1 패키지 구성

| 패키지 | 역할 |
|---|---|
| `payload` | 코어 (Local API, 훅, 접근제어, 검증, 타입) |
| `@payloadcms/next` | 어드민 패널 + HTTP 계층 (REST/GraphQL) |
| `@payloadcms/db-postgres` | Postgres 어댑터 (내부적으로 Drizzle) |
| `@payloadcms/richtext-lexical` | 리치 텍스트 에디터 |
| `@payloadcms/storage-s3` | R2 연결 (R2는 S3 호환 API 사용) |
| `@payloadcms/plugin-seo` | 메타/OG 필드 자동 주입 |
| `@payloadcms/plugin-nested-docs` | 여행 리뷰 부모-자식 관계 |
| `@payloadcms/plugin-redirects` | `/categories/kitchen` → `living` 301 |
| `@payloadcms/plugin-form-builder` *(선택)* | 뉴스레터 폼. 직접 구현도 무방 |

### 1.2 렌더링·캐시 전략

| 대상 | 전략 |
|---|---|
| 홈 | RSC + ISR `revalidate: 600`, 발행 시 `revalidateTag('home')` |
| 리뷰 상세 | `generateStaticParams` (발행글 전량) + `revalidateTag('review:{slug}')` |
| 목록/필터 | 첫 페이지 ISR, 필터 적용 시 클라이언트 fetch (REST API 또는 서버 액션) |
| 댓글 | 동적 (`no-store`) |
| 어드민 | Payload가 자체 처리 (`force-dynamic`) |
| 집계(stats) | Redis 1시간 TTL |

**on-demand revalidate** — 별도 웹훅 불필요. `afterChange` 훅에서 직접 호출:

```ts
// collections/Reviews/hooks/revalidate.ts
import { revalidateTag, revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

export const revalidateReview: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  if (doc._status === 'published') {
    revalidateTag(`review:${doc.slug}`)
    revalidateTag('home')
    revalidatePath('/reviews')
  }
  // 슬러그가 바뀌었으면 옛 경로도 무효화
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    revalidateTag(`review:${previousDoc.slug}`)
  }
  return doc
}
```

---

## 2. 데이터 모델 (Payload 컬렉션)

### 2.0 설계 전략

rev.2의 다형 리뷰 타입(`PRODUCT` / `TRIP` / `STAY` / `PLACE` / `COMPARISON`)을
**단일 `reviews` 컬렉션 + `type` 판별자 + 조건부 필드 그룹**으로 구현한다.

Payload의 `admin.condition`은 **다른 필드 값에 따라 필드를 보이거나 숨긴다.**
Prisma에서 확장 테이블 3개로 나눴던 것을 여기서는 **필드 그룹의 조건부 노출**로 처리한다.

| Prisma 안 | Payload 안 | 이유 |
|---|---|---|
| `TripDetail` 테이블 | `tripDetail` group + `condition: type === 'trip'` | 목록/검색 시 JOIN 불필요 |
| `StayDetail` 테이블 | `stayDetail` group + condition | 동일 |
| `ComparisonItem[]` | `comparison` array 필드 | Payload array는 별도 테이블로 자동 정규화됨 |
| `ReviewProsCons[]` | `pros` / `cons` array 필드 | 어드민에서 드래그 정렬 자동 지원 |
| `ReviewScore[]` | `scores` array 필드 | |

> Postgres 어댑터는 array/group 필드를 **자동으로 별도 테이블로 정규화**한다.
> 즉 스키마 품질은 Prisma 안과 동일하면서, 어드민 UI는 공짜로 얻는다.

### 2.1 컬렉션 목록

| 컬렉션 | slug | 인증 | 비고 |
|---|---|---|---|
| 리뷰 | `reviews` | — | 핵심. 드래프트+버전 활성화 |
| 카테고리 | `categories` | — | 6종 |
| 태그 | `tags` | — | 상황 태그 |
| 미디어 | `media` | — | `upload: true`, R2 |
| 관리자·회원 | `users` | ✅ `auth` | `role`로 ADMIN/MEMBER 구분 |
| 댓글 | `comments` | — | 검수 대상 |
| 구독자 | `subscribers` | — | 더블 옵트인 |
| 뉴스레터 이슈 | `newsletter-issues` | — | |
| 제휴 링크 | `affiliate-links` | — | |
| 제휴 클릭 | `affiliate-clicks` | — | 읽기 전용(어드민만) |
| **Global** | `site-settings` | — | 히어로 카피, 트러스트 라벨, 원칙 5개 |

### 2.2 `reviews` 컬렉션

```ts
// src/collections/Reviews/index.ts
import type { CollectionConfig } from 'payload'
import { admins, adminsOrPublished } from '@/access'
import { validatePublish } from './hooks/validatePublish'
import { revalidateReview } from './hooks/revalidate'
import { deriveAutoTags } from './hooks/deriveAutoTags'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'category', '_status', 'publishedAt'],
    livePreview: {
      url: ({ data }) => `${process.env.NEXT_PUBLIC_SITE_URL}/reviews/${data.slug}?preview=true`,
    },
  },
  access: {
    read: adminsOrPublished,   // 비로그인은 published만
    create: admins,
    update: admins,
    delete: admins,
  },
  versions: {
    drafts: { autosave: { interval: 2000 } },   // 자동 저장 + 프리뷰
    maxPerDoc: 20,
  },
  hooks: {
    beforeValidate: [validatePublish],  // 발행 조건 강제 (§3)
    beforeChange:   [deriveAutoTags],   // wouldRepeat → 태그 자동 부여
    afterChange:    [revalidateReview],
  },
  fields: [
    // ── 판별자 ──────────────────────────────────────────
    {
      name: 'type', type: 'select', required: true, defaultValue: 'product',
      options: [
        { label: '물건',      value: 'product' },
        { label: '여행 일정', value: 'trip' },
        { label: '숙소',      value: 'stay' },
        { label: '맛집·여행지', value: 'place' },
        { label: '비교',      value: 'comparison' },
      ],
      admin: { position: 'sidebar' },
    },

    // ── 기본 ────────────────────────────────────────────
    { name: 'title', type: 'text', required: true, maxLength: 100 },
    {
      name: 'slug', type: 'text', required: true, unique: true, index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'conclusion', type: 'textarea', required: true, maxLength: 160,
      label: '한 줄 결론',
      admin: { description: '카드에 노출됩니다. 구매 판단에 필요한 결론만.' },
    },
    { name: 'content', type: 'richText', required: true },      // Lexical
    { name: 'excerpt', type: 'textarea', maxLength: 200 },

    { name: 'category', type: 'relationship', relationTo: 'categories', required: true, index: true },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true, index: true },
    {
      name: 'parent', type: 'relationship', relationTo: 'reviews',
      label: '상위 리뷰',
      admin: {
        description: '여행 일정에 속한 숙소·여행지를 연결합니다.',
        condition: (data) => ['stay', 'place', 'comparison'].includes(data?.type),
      },
    },

    // ── 공통 신뢰 축 ─────────────────────────────────────
    {
      type: 'collapsible', label: '경험 정보',
      fields: [
        { name: 'subjectName', type: 'text', label: '대상 이름' },
        { name: 'brand', type: 'text' },
        {
          name: 'acquisitionType', type: 'select', required: true, defaultValue: 'purchase',
          options: [
            { label: '직접 구매',   value: 'purchase' },
            { label: '직접 예약',   value: 'booking' },
            { label: '직접 방문',   value: 'visit' },
            { label: '선물받음',    value: 'gifted' },
            { label: '렌탈',        value: 'rental' },
            { label: '협찬',        value: 'sponsored' },
            { label: '초대',        value: 'invited' },
          ],
        },
        { name: 'experiencedAt', type: 'date' },
        {
          type: 'row',
          fields: [
            { name: 'experienceScale', type: 'number', required: true, min: 1, admin: { width: '50%' } },
            {
              name: 'experienceUnit', type: 'select', required: true, defaultValue: 'month',
              options: [
                { label: '개월 사용', value: 'month' }, { label: '박 숙박', value: 'night' },
                { label: '일 여행',   value: 'day' },   { label: '인 식사', value: 'person' },
                { label: '회 방문',   value: 'visit_count' },
              ],
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'totalCost', type: 'number', label: '비용 (KRW)', min: 0, admin: { width: '60%' } },
            { name: 'costNote', type: 'text', maxLength: 60, admin: { width: '40%', placeholder: '2인 기준' } },
          ],
        },
        { name: 'vendor', type: 'text', label: '구매처 / 예약 플랫폼' },
        { name: 'wouldRepeat', type: 'checkbox', label: '다시 할 의향 있음', defaultValue: false },
      ],
    },

    // ── 평가 ────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'rating', type: 'number', required: true, min: 0.5, max: 5, admin: { step: 0.1, width: '50%' } },
        { name: 'initialRating', type: 'number', min: 0.5, max: 5, admin: { step: 0.1, width: '50%', readOnly: true } },
      ],
    },
    {
      name: 'pros', type: 'array', minRows: 1, labels: { singular: '장점', plural: '장점' },
      fields: [{ name: 'text', type: 'text', required: true, maxLength: 80 }],
    },
    {
      name: 'cons', type: 'array', minRows: 1, labels: { singular: '단점', plural: '단점' },
      admin: { description: '단점 없이는 발행할 수 없습니다.' },
      fields: [{ name: 'text', type: 'text', required: true, maxLength: 80 }],
    },
    {
      name: 'scores', type: 'array', label: '재평가 이력',
      fields: [
        { name: 'score', type: 'number', required: true, min: 0.5, max: 5, admin: { step: 0.1 } },
        { name: 'scaleAtTime', type: 'number', required: true },
        { name: 'note', type: 'text', maxLength: 200 },
        { name: 'evaluatedAt', type: 'date', required: true },
      ],
    },

    // ── 타입별 확장 ──────────────────────────────────────
    {
      name: 'tripDetail', type: 'group', label: '여행 정보',
      admin: { condition: (data) => data?.type === 'trip' },
      fields: [
        { type: 'row', fields: [
          { name: 'destination', type: 'text', required: true, admin: { width: '50%' } },
          { name: 'countryCode', type: 'text', maxLength: 2, admin: { width: '50%' } },
        ]},
        { type: 'row', fields: [
          { name: 'nights', type: 'number', required: true, min: 1, admin: { width: '33%' } },
          { name: 'days',   type: 'number', required: true, min: 1, admin: { width: '33%' } },
          { name: 'headcount', type: 'number', defaultValue: 2, admin: { width: '33%' } },
        ]},
        {
          name: 'costBreakdown', type: 'group', label: '경비 내역 (KRW)',
          fields: [{ type: 'row', fields: [
            { name: 'flight',  type: 'number', min: 0, admin: { width: '20%' } },
            { name: 'stay',    type: 'number', min: 0, admin: { width: '20%' } },
            { name: 'food',    type: 'number', min: 0, admin: { width: '20%' } },
            { name: 'transit', type: 'number', min: 0, admin: { width: '20%' } },
            { name: 'etc',     type: 'number', min: 0, admin: { width: '20%' } },
          ]}],
        },
        {
          name: 'itinerary', type: 'array', label: '일자별 동선', minRows: 1,
          fields: [
            { name: 'day', type: 'number', required: true },
            { name: 'title', type: 'text', required: true },
            { name: 'places', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
            { name: 'memo', type: 'textarea' },
          ],
        },
      ],
    },
    {
      name: 'stayDetail', type: 'group', label: '숙소 정보',
      admin: { condition: (data) => data?.type === 'stay' },
      fields: [
        { type: 'row', fields: [
          { name: 'nights', type: 'number', required: true, min: 1, admin: { width: '50%' } },
          { name: 'pricePerNight', type: 'number', required: true, min: 0, admin: { width: '50%' } },
        ]},
        { name: 'roomType', type: 'text' },
        { type: 'row', fields: [
          { name: 'nearestStation', type: 'text', admin: { width: '60%' } },
          { name: 'walkMinutes', type: 'number', min: 0, admin: { width: '40%' } },
        ]},
        { type: 'row', fields: [
          { name: 'checkIn',  type: 'text', admin: { width: '50%', placeholder: '15:00' } },
          { name: 'checkOut', type: 'text', admin: { width: '50%', placeholder: '11:00' } },
        ]},
        { name: 'address', type: 'text' },
        { name: 'location', type: 'point' },   // [lng, lat] — JSON-LD geo에 사용
      ],
    },
    {
      name: 'comparison', type: 'array', label: '비교 대상',
      admin: { condition: (data) => data?.type === 'comparison' },
      minRows: 2,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'summary', type: 'text', maxLength: 120 },
        { name: 'isPick', type: 'checkbox', label: '우리의 선택' },
        {
          name: 'attributes', type: 'array', label: '비교 항목',
          fields: [{ type: 'row', fields: [
            { name: 'key',   type: 'text', required: true, admin: { width: '40%' } },
            { name: 'value', type: 'text', required: true, admin: { width: '60%' } },
          ]}],
        },
      ],
    },

    // ── 미디어 ──────────────────────────────────────────
    { name: 'coverImage', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'fallbackArt', type: 'select', admin: { position: 'sidebar' },
      options: ['dishwasher','mattress','food','sofa','pan','laundry','suitcase','sapporo','hotel','onsen']
        .map((v) => ({ label: v, value: v })),
    },

    // ── 사이드바 ────────────────────────────────────────
    { name: 'isFeatured', type: 'checkbox', admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'viewCount', type: 'number', defaultValue: 0, admin: { position: 'sidebar', readOnly: true } },
    { name: 'monthlyViews', type: 'number', defaultValue: 0, admin: { hidden: true } },
  ],
}
```

> `@payloadcms/plugin-seo`가 `meta.title` / `meta.description` / `meta.image` 필드를 자동 주입하므로,
> SEO 필드는 위 스키마에 직접 쓰지 않는다.

### 2.3 나머지 컬렉션 (요약)

```ts
// users — 관리자와 일반회원을 한 컬렉션에서 role로 구분
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    cookies: { sameSite: 'Lax', secure: true },
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    read:   ({ req: { user } }) => user?.role === 'admin' || { id: { equals: user?.id } },
    create: () => true,                       // 소셜 가입 허용
    update: ({ req: { user } }) => user?.role === 'admin' || { id: { equals: user?.id } },
    delete: admins,
    admin:  ({ req: { user } }) => user?.role === 'admin',   // 어드민 패널 진입 권한
  },
  fields: [
    { name: 'nickname', type: 'text', required: true },
    { name: 'role', type: 'select', required: true, defaultValue: 'member',
      options: [{ label: '관리자', value: 'admin' }, { label: '회원', value: 'member' }],
      access: { update: ({ req }) => req.user?.role === 'admin' } },   // 권한 상승 차단
    { name: 'avatarUrl', type: 'text' },
    { name: 'isBlocked', type: 'checkbox', defaultValue: false },
  ],
}

// comments
export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: { useAsTitle: 'body', defaultColumns: ['body', 'review', 'author', 'status'] },
  access: {
    read:   ({ req: { user } }) => user?.role === 'admin' || { status: { equals: 'published' } },
    create: ({ req: { user } }) => Boolean(user) && !user.isBlocked,
    update: ({ req: { user } }) => user?.role === 'admin' || { author: { equals: user?.id } },
    delete: ({ req: { user } }) => user?.role === 'admin' || { author: { equals: user?.id } },
  },
  fields: [
    { name: 'review', type: 'relationship', relationTo: 'reviews', required: true, index: true },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true },
    { name: 'parent', type: 'relationship', relationTo: 'comments' },
    { name: 'body', type: 'textarea', required: true, maxLength: 1000 },
    { name: 'status', type: 'select', defaultValue: 'published',
      options: ['published','pending','hidden','deleted'].map((v) => ({ label: v, value: v })) },
    { name: 'reportCount', type: 'number', defaultValue: 0 },
  ],
}

// media — R2 업로드 + alt 필수
export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true, create: admins, update: admins, delete: admins },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'thumb', width: 200, height: 200, position: 'centre' },
      { name: 'card',  width: 800 },
      { name: 'cover', width: 1600 },
    ],
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 82 } },
  },
  fields: [
    { name: 'alt', type: 'text', required: true,
      admin: { description: '스크린리더용 설명. 비워둘 수 없습니다.' } },
    { name: 'credit', type: 'text', label: '출처' },
  ],
}
```

**Global — 사이트 설정**

```ts
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true, update: admins },
  fields: [
    { name: 'heroTitle', type: 'textarea' },
    { name: 'heroDescription', type: 'textarea' },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'trustLabels', type: 'array', maxRows: 4,
      fields: [{ name: 'label', type: 'text' }, { name: 'metric', type: 'select',
        options: ['total','longTerm','directRatio','lastUpdated'].map((v)=>({label:v,value:v})) }] },
    { name: 'principles', type: 'array', maxRows: 6,
      fields: [{ name: 'title', type: 'text' }, { name: 'description', type: 'textarea' }] },
    { name: 'showTravelSection', type: 'checkbox', defaultValue: false,
      admin: { description: '여행 리뷰 3건 미만이면 꺼두세요.' } },
  ],
}
```

> `showTravelSection`은 §11 리스크(여행 콘텐츠 공급 부족)에 대한 직접적 대응이다.

### 2.4 화면 ↔ 필드 매핑

| 시안 UI | 필드 |
|---|---|
| `<span class="tag">가전</span>` | `category.name` |
| `직접 구매` / `직접 예약` / `직접 방문` | `acquisitionType` → `ACQUISITION_LABEL` |
| `6개월 사용` / `3박 숙박` / `2인 식사` | `experienceScale` + `experienceUnit` |
| `평가 변경` (terracotta) | `initialRating !== rating` |
| `.review-conclusion` | `conclusion` |
| `.pros span` / `.cons span` | `pros[0].text` / `cons[0].text` |
| `.rating strong` | `rating` |
| `.score-change` "처음 4.2 → 현재 4.5" | `scores[0].score` → `rating` |
| `.buy-again` | `wouldRepeat` → `REPEAT_LABEL[type]` |
| `.travel-card .tag` "여행 일정" | `type` → `TYPE_LABEL` |
| 여행 리드 "총경비 / 동선" | `totalCost` / `tripDetail.itinerary` |
| trust strip 4지표 | 집계 쿼리 (§4) |

### 2.5 표시 라벨 파생

DB에 표시 문자열을 저장하지 않는다. `payload-types.ts`가 자동 생성한 타입 위에 매핑만 둔다.

```ts
// src/lib/labels.ts
import type { Review } from '@/payload-types'

export const ACQUISITION_LABEL = {
  purchase: '직접 구매', booking: '직접 예약', visit: '직접 방문',
  gifted: '선물받음', rental: '렌탈', sponsored: '협찬', invited: '초대',
} as const

export const UNIT_LABEL = {
  month: '개월 사용', night: '박 숙박', day: '일 여행',
  person: '인 식사', visit_count: '회 방문',
} as const

export const TYPE_LABEL = {
  product: '', trip: '여행 일정', stay: '숙소 리뷰',
  place: '여행지', comparison: '비교',
} as const

export const REPEAT_LABEL = {
  product: '다시 구매할 의향 있음', trip: '다시 갈 의향 있음',
  stay: '다시 묵을 의향 있음', place: '다시 방문할 의향 있음',
  comparison: '다시 선택할 의향 있음',
} as const

/** 협찬·초대는 반드시 시각적으로 구분한다 */
export const isSponsored = (r: Review) =>
  r.acquisitionType === 'sponsored' || r.acquisitionType === 'invited'
```

---

## 3. 발행 검증 — 기획을 코드로 강제하는 지점

기획서가 약속한 것(단점 노출, 총경비 공개, "우리의 선택")을 **`beforeValidate` 훅에서 강제**한다.
이 파일 하나가 서비스 정체성의 방어선이다.

```ts
// src/collections/Reviews/hooks/validatePublish.ts
import { ValidationError } from 'payload'
import type { CollectionBeforeValidateHook } from 'payload'
import type { Review } from '@/payload-types'

export const validatePublish: CollectionBeforeValidateHook<Review> = async ({
  data, originalDoc, operation,
}) => {
  // data는 변경된 필드만 담긴 delta이므로 originalDoc과 병합해서 검사한다
  const doc = { ...originalDoc, ...data } as Review
  if (doc._status !== 'published') return data   // 초안은 자유롭게 저장

  const errors: { field: string; message: string }[] = []
  const fail = (field: string, message: string) => errors.push({ field, message })

  // ── 공통 ──────────────────────────────────────────
  if (!doc.pros?.length) fail('pros', '장점을 최소 1개 입력해주세요.')
  if (!doc.cons?.length) fail('cons', '단점을 최소 1개 입력해주세요. 단점 없는 리뷰는 발행할 수 없습니다.')
  if (!doc.coverImage)   fail('coverImage', '커버 이미지가 필요합니다.')
  if (!doc.acquisitionType) fail('acquisitionType', '어떻게 얻은 경험인지 밝혀주세요.')
  if (!doc.tags?.length) fail('tags', '상황 태그를 최소 1개 선택해주세요. 필터에서 누락됩니다.')
  if (!doc.experienceScale || doc.experienceScale < 1)
    fail('experienceScale', '경험 규모를 입력해주세요.')

  // ── 타입별 ────────────────────────────────────────
  switch (doc.type) {
    case 'product':
      if (doc.experienceUnit !== 'month')
        fail('experienceUnit', '물건 리뷰는 사용 개월 단위여야 합니다.')
      if (!doc.totalCost)
        fail('totalCost', '구매가를 공개해주세요.')
      break

    case 'trip': {
      const t = doc.tripDetail
      if (!doc.totalCost) fail('totalCost', '총경비 없이는 발행할 수 없습니다.')
      if (!t?.nights || !t?.days) fail('tripDetail.nights', '여행 기간을 입력해주세요.')
      if (!t?.itinerary?.length) fail('tripDetail.itinerary', '일자별 동선을 최소 1일 입력해주세요.')

      // 경비 내역을 입력했다면 합계가 총경비와 맞아야 한다
      const b = t?.costBreakdown
      const sum = [b?.flight, b?.stay, b?.food, b?.transit, b?.etc]
        .filter((n): n is number => typeof n === 'number')
      if (sum.length && sum.reduce((a, c) => a + c, 0) !== doc.totalCost)
        fail('tripDetail.costBreakdown', '경비 내역 합계가 총경비와 다릅니다.')
      break
    }

    case 'stay':
      if (!doc.stayDetail?.pricePerNight) fail('stayDetail.pricePerNight', '1박 요금을 공개해주세요.')
      if (!doc.stayDetail?.nights) fail('stayDetail.nights', '숙박일수를 입력해주세요.')
      break

    case 'place':
      if (!doc.totalCost && !doc.costNote)
        fail('totalCost', '지출 금액 또는 기준을 입력해주세요.')
      break

    case 'comparison': {
      const items = doc.comparison ?? []
      if (items.length < 2) fail('comparison', '비교 대상을 2개 이상 등록해주세요.')
      const picks = items.filter((i) => i.isPick).length
      if (picks !== 1) fail('comparison', '"우리의 선택"을 정확히 1개 지정해주세요.')
      break
    }
  }

  if (errors.length) throw new ValidationError({ errors })

  // ── 자동 채움 ─────────────────────────────────────
  if (!doc.publishedAt) data.publishedAt = new Date().toISOString()
  if (doc.initialRating == null) data.initialRating = doc.rating
  if (!doc.excerpt) data.excerpt = doc.conclusion

  return data
}
```

**자동 태그 부여** — 수동 태깅 실수를 원천 차단:

```ts
// src/collections/Reviews/hooks/deriveAutoTags.ts
export const deriveAutoTags: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data.wouldRepeat) return data
  const { docs } = await req.payload.find({
    collection: 'tags', where: { slug: { equals: 'buy-again' } }, limit: 1,
  })
  const tagId = docs[0]?.id
  if (tagId && !data.tags?.includes(tagId)) {
    data.tags = [...(data.tags ?? []), tagId]
  }
  return data
}
```

---

## 4. 데이터 접근 (API 계층 없음)

REST/GraphQL은 Payload가 `/api/*`에 **자동 노출**하지만, 공개 페이지는 Local API를 쓴다.

```ts
// src/lib/queries.ts — 서버 전용
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const payloadClient = async () => getPayload({ config })

export const getFeaturedReviews = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'reviews',
      where: { _status: { equals: 'published' } },
      sort: '-monthlyViews', limit: 3, depth: 2,
    })
    return docs
  },
  ['featured-reviews'],
  { tags: ['home'], revalidate: 600 },
)

export const getTravelReviews = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'reviews',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { type: { in: ['trip', 'stay', 'comparison'] } },
        ],
      },
      sort: '-publishedAt', limit: 3, depth: 2,
    })
    return docs
  },
  ['travel-reviews'],
  { tags: ['home', 'travel'], revalidate: 600 },
)

/** 트러스트 스트립 4지표 */
export const getSiteStats = unstable_cache(
  async () => {
    const payload = await payloadClient()
    const base = { _status: { equals: 'published' } } as const
    const [total, longTerm, direct, latest] = await Promise.all([
      payload.count({ collection: 'reviews', where: base }),
      payload.count({ collection: 'reviews', where: { and: [base,
        { experienceUnit: { equals: 'month' } }, { experienceScale: { greater_than_equal: 3 } }] } }),
      payload.count({ collection: 'reviews', where: { and: [base,
        { acquisitionType: { in: ['purchase', 'booking', 'visit'] } }] } }),
      payload.find({ collection: 'reviews', where: base, sort: '-updatedAt', limit: 1 }),
    ])
    return {
      total: total.totalDocs,
      longTerm: longTerm.totalDocs,
      directRatio: total.totalDocs ? Math.round((direct.totalDocs / total.totalDocs) * 100) : 0,
      lastUpdated: latest.docs[0]?.updatedAt,
    }
  },
  ['site-stats'],
  { tags: ['home'], revalidate: 3600 },
)
```

**클라이언트 필터** — 상황 태그 칩은 REST API를 직접 호출:

```
GET /api/reviews?where[tags][in]=<tagId>&where[_status][equals]=published&limit=12&depth=2
```

Payload의 쿼리 언어는 Local API / REST / GraphQL이 **완전히 동일**하므로,
서버·클라이언트 어디서든 같은 `where` 객체를 재사용할 수 있다.

### 4.1 직접 만들어야 하는 엔드포인트

Payload가 커버하지 않아 Next Route Handler로 작성할 것:

| 경로 | 용도 |
|---|---|
| `app/go/[linkId]/route.ts` | 제휴 클릭 집계 후 302. `rel="sponsored nofollow noopener"` |
| `app/api/views/route.ts` | 조회수 (Redis 카운터 + 5분 배치 flush) |
| `app/api/subscribe/route.ts` | 구독 신청 → Resend 확인 메일 (Turnstile 검증 포함) |
| `app/newsletter/confirm/route.ts` | 더블 옵트인 확인 |
| `app/newsletter/unsubscribe/route.ts` | 해지 |
| `app/sitemap.ts` / `app/robots.ts` / `app/feed.xml/route.ts` | SEO |

Payload 커스텀 엔드포인트(`endpoints`)로 넣어도 되지만,
**Next Route Handler가 `revalidateTag`·`cookies()` 접근이 자연스러워** 권장한다.

---

## 5. 인증 · 보안

### 5.1 인증

Payload `auth: true`가 JWT + httpOnly 쿠키 + 로그인 시도 제한 + 비밀번호 재설정을 **전부 제공**한다.

| 대상 | 방식 |
|---|---|
| 관리자 | 이메일 + 비밀번호. `access.admin`으로 어드민 패널 진입 통제 |
| 회원 | 카카오 OAuth → Payload 사용자 upsert 후 동일 쿠키 세션 발급 |
| 세션 | httpOnly, `SameSite=Lax`, `Secure`, 7일 |

카카오 로그인은 Route Handler에서 처리 후 Payload 로그인으로 연결:

```ts
// app/api/auth/kakao/callback/route.ts (요지)
const profile = await exchangeKakaoCode(code)          // state nonce 검증 필수
const payload = await getPayload({ config })
const existing = await payload.find({
  collection: 'users', where: { email: { equals: profile.email } }, limit: 1,
})
if (!existing.docs.length) {
  await payload.create({ collection: 'users', data: {
    email: profile.email, nickname: profile.nickname, role: 'member',
    password: crypto.randomUUID(),                     // 소셜 전용, 직접 로그인 불가
  }})
}
const { token } = await payload.login({
  collection: 'users', data: { email: profile.email, password: /* 저장된 값 */ },
})
```

> 소셜 사용자는 임의 비밀번호를 쓰므로 **비밀번호 로그인 경로를 막아야 한다.**
> `beforeLogin` 훅에서 `provider === 'kakao'`인 계정의 로컬 로그인을 거부한다.

### 5.2 보안 체크리스트

| 항목 | 조치 |
|---|---|
| 권한 상승 | `users.role` 필드에 `access.update` — 관리자만 변경 가능 (§2.3) |
| 접근 제어 | 컬렉션별 `access`. **`read`는 published만 반환**하도록 쿼리 제약 반환 |
| XSS | Lexical은 구조화 JSON이라 기본 안전. 댓글은 **plain text만** 허용 |
| Rate limit | Payload `defaultLimit` + Route Handler에 Redis 기반 제한 (댓글 5/분, 구독 3/시간) |
| 봇 | 구독·댓글에 Cloudflare Turnstile |
| 업로드 | `mimeTypes` 화이트리스트, sharp 재인코딩으로 **EXIF(GPS) 자동 제거** |
| 헤더 | `next.config` 보안 헤더 + CSP |
| 시크릿 | `PAYLOAD_SECRET` 필수. `.env` 커밋 금지 |
| 개인정보 | IP/UA는 해시만 저장. 구독자 이메일 최소 수집 |

> 여행 사진 GPS 제거는 Payload가 sharp로 재인코딩하며 **자동 처리**된다.
> NestJS 안에서는 직접 구현해야 했던 항목이다.

---

## 6. 이미지

```
어드민에서 드래그앤드롭
  → Payload가 sharp로 리사이즈 (thumb/card/cover) + WebP 변환 + EXIF 제거
  → @payloadcms/storage-s3 어댑터가 R2에 업로드
  → media 문서에 크기·URL 자동 기록
```

```ts
// payload.config.ts
s3Storage({
  collections: { media: true },
  bucket: process.env.R2_BUCKET!,
  config: {
    endpoint: process.env.R2_ENDPOINT,     // https://<account>.r2.cloudflarestorage.com
    region: 'auto',                        // ⚠️ R2는 반드시 'auto'
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  },
})
```

**표시**: `next/image` + `remotePatterns`에 R2 커스텀 도메인 등록.

> ⚠️ **blur placeholder는 Payload가 만들어주지 않는다.**
> `media` 컬렉션의 `beforeChange` 훅에서 sharp로 20px base64를 생성해 `blurDataUrl` 필드에 저장한다.
> 이건 직접 써야 하는 몇 안 되는 코드다.

---

## 7. SEO

| 항목 | 구현 |
|---|---|
| 메타/OG 필드 | `@payloadcms/plugin-seo` — 어드민에 미리보기 포함 필드 자동 주입 |
| `generateMetadata` | `meta.title ?? title`, `meta.description ?? excerpt ?? conclusion` |
| OG 이미지 | `next/og` `ImageResponse` 동적 생성 (제목 + 별점 + 카테고리) |
| sitemap / robots / RSS | `app/sitemap.ts`, `app/robots.ts`, `app/feed.xml/route.ts` |
| 301 리다이렉트 | `@payloadcms/plugin-redirects` — `/categories/kitchen` → `/categories/living` |
| 페이지네이션 | 2페이지 이상 `noindex, follow` |

**JSON-LD 타입 분기** (rev.2 §6 유지)

| `type` | schema.org | 소스 필드 |
|---|---|---|
| `product` | `Product` | `brand`, `totalCost` |
| `trip` | `TouristTrip` | `tripDetail.itinerary`, `destination` |
| `stay` | `Hotel` | `stayDetail.address`, `pricePerNight`, `location` |
| `place` (맛집) | `Restaurant` | `address`, `totalCost` |
| `comparison` | `ItemList` | `comparison[]` |

> ⚠️ `aggregateRating`은 자사 단독 평가에 사용 금지. `Review.reviewRating`만 사용.

---

## 8. 다크 모드

디자인 명세 §7.2·§7.3 참조. 스택 변경과 무관하게 동일하다.

| 항목 | 구현 |
|---|---|
| 적용 | `<html data-theme="dark">` |
| 토큰 | CSS 변수 재정의. Tailwind `darkMode: ['selector', '[data-theme="dark"]']` |
| 초기값 | `localStorage` → 없으면 `prefers-color-scheme` |
| FOUC | `next-themes` (`attribute="data-theme"`) 권장 |
| 필수 수정 | `--color-on-primary`, `--color-tag-accent`, `--color-focus-ring` 추가 |

> Payload 어드민 패널은 자체 테마를 가지므로 별도 대응 불필요.

---

## 9. 프로젝트 구조

```
sinhonbubu-blog/
├─ src/
│  ├─ app/
│  │  ├─ (site)/                     # 공개 — 헤더/푸터 레이아웃
│  │  │  ├─ page.tsx                 # 홈 (Local API 직접 호출)
│  │  │  ├─ reviews/[slug]/page.tsx
│  │  │  ├─ reviews/page.tsx
│  │  │  ├─ travel/page.tsx
│  │  │  ├─ categories/[slug]/page.tsx
│  │  │  ├─ tags/[slug]/page.tsx
│  │  │  └─ about/page.tsx
│  │  ├─ (payload)/                  # Payload 생성 — 건드리지 않음
│  │  │  ├─ admin/[[...segments]]/
│  │  │  └─ api/[...slug]/
│  │  ├─ go/[linkId]/route.ts
│  │  ├─ api/{views,subscribe,auth}/
│  │  └─ sitemap.ts · robots.ts · feed.xml/
│  ├─ collections/
│  │  ├─ Reviews/{index.ts, hooks/}
│  │  ├─ Categories.ts · Tags.ts · Media.ts · Users.ts
│  │  ├─ Comments.ts · Subscribers.ts
│  │  └─ AffiliateLinks.ts · AffiliateClicks.ts
│  ├─ globals/SiteSettings.ts
│  ├─ access/{admins.ts, adminsOrPublished.ts}
│  ├─ components/{ui,layout,review,home}/
│  ├─ lib/{queries.ts, labels.ts, seo.ts, fonts.ts}
│  ├─ styles/{globals.css, placeholder-art.css}
│  └─ payload.config.ts
├─ payload-types.ts                  # 자동 생성 — 커밋 O, 수동 편집 X
└─ docs/
```

**단일 저장소, 단일 배포.** 모노레포도 `packages/types`도 필요 없다.

### 9.1 기술 선택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 15 App Router | |
| CMS | **Payload 3.86.x** | 전 패키지 버전 동일 고정 |
| DB | PostgreSQL (`@payloadcms/db-postgres`) | |
| 에디터 | Lexical (`@payloadcms/richtext-lexical`) | 신규 프로젝트 권장 |
| 스타일 | Tailwind v4 + CSS 변수 | 시안 토큰 이식 |
| 스토리지 | Cloudflare R2 (S3 어댑터) | egress 무료 |
| 메일 | Resend | |
| 캐시/RL | Redis (Upstash) | 조회수·rate limit |
| 배포 | **Vercel 또는 Railway** | Payload는 상시 구동형 권장 |
| 테스트 | Vitest + Playwright | |

> **배포 주의**: Payload 어드민은 서버리스에서도 동작하지만 콜드 스타트가 체감된다.
> 트래픽이 적은 초기에는 Railway/Fly 같은 상시 구동형이 어드민 사용성에 유리하다.

---

## 10. 개발 로드맵

NestJS 안 8주 → **4주**.

| 주차 | 산출물 |
|---|---|
| **W1** | Payload 셋업(Postgres·R2·Lexical), 전 컬렉션 스키마 정의, 시드 12건, 디자인 토큰 → Tailwind 이식, `globals.css` |
| **W2** | UI 프리미티브 + 레이아웃, **홈을 시안과 픽셀 일치까지 퍼블리싱**(Local API 실데이터), 다크 모드 전면 적용 + 대비 수정 3건 + 리터럴 색 토큰화 |
| **W3** | 리뷰 상세(타입별 결론 박스 5종, Lexical 렌더, 재평가 타임라인, 관련글), 목록/카테고리/태그/검색, 여행 허브 + 경비 breakdown + 동선 UI |
| **W4** | 발행 검증 훅, 댓글·카카오 로그인, 뉴스레터(더블 옵트인), 제휴 `/go` + 클릭 집계, SEO 마감(JSON-LD 5종·sitemap·RSS·OG), 접근성 감사(라이트+다크), 배포 |

**마일스톤 게이트**

- W1 종료: 어드민에서 리뷰 1건을 **모든 타입으로** 입력 가능 (프론트 없이)
- W2 종료: 시안과 시각적 diff 통과 + 다크 모드 axe 위반 0건
- W3 종료: `TRIP` 1건 + 하위 `STAY` 1건 연결 발행 및 화면 확인
- W4 종료: Lighthouse 모바일 성능 90+, 접근성 100 (양 테마)

> **W1에 어드민이 먼저 완성된다**는 점이 이 스택의 가장 큰 실익이다.
> 프론트 개발과 **콘텐츠 집필을 W2부터 병행**할 수 있다.
> NestJS 안에서는 어드민이 W4에나 나왔다.

### 10.1 축소 우선순위

1. `COMPARISON` 타입 → v1.1 (기획서 이슈 #12)
2. 경비 breakdown 차트 → 표로 대체
3. `itinerary` 타임라인 UI → 본문 작성으로 대체 (데이터는 저장)
4. 다크 모드 → ❌ 축소 불가 (나중에 넣으면 리터럴 색을 다시 다 걷어내야 함)

---

## 11. 리스크

| 리스크 | 영향 | 대응 |
|---|---|---|
| **Payload v4 마이그레이션** | 중기 유지보수 부담 | v3로 시작, 버전 고정. v4는 안정화 후 이전 |
| **여행 리뷰 공급 부족** | 여행 섹션이 빈 채로 노출 | `SiteSettings.showTravelSection`으로 숨김. 3건 확보 전 미노출 |
| **여행 SEO 경쟁 열세** | 유입 없이 개발비 소모 | 기획서 이슈 #11 — 물건 우선 전략 |
| 콘텐츠 생산 속도 | 빈 사이트로 오픈 | **W2부터 병행 집필** (어드민이 W1에 완성되므로 가능) |
| 다크 모드 회귀 | 새 컴포넌트마다 리터럴 색 재유입 | CI에 리터럴 HEX 금지 lint |
| Payload 어드민 커스터마이징 한계 | 특정 UI 요구 미충족 | 커스텀 React 컴포넌트 주입 가능. 단 공수 발생 |
| 서버리스 콜드 스타트 | 어드민 체감 저하 | 상시 구동형 배포 |
| 개인정보 유출 | 법적 리스크 | 최소 수집, EXIF 자동 제거, 해지 링크 상시 |

---

## 부록. NestJS 안에서 넘어온 결정 사항

Payload로 바뀌어도 **그대로 유효한** 판단:

- 리뷰 타입 5종 다형 구조 (§2.0)
- 공통 축 일반화: `acquisitionType` / `experienceScale` / `wouldRepeat`
- 발행 시 단점 1개 이상, 총경비 필수 강제
- 표시 문자열을 DB에 저장하지 않고 파생
- JSON-LD 타입별 분기
- 태그 2계층 분리 (기획서 §2.1)
- 조회수 Redis 버퍼 + 배치 flush
- 제휴 링크를 컬렉션으로 추상화 (본문 하드코딩 금지)

**폐기된 것**: 모노레포, `packages/types`, BFF 프록시, JWT 직접 구현, presign 업로드,
어드민 CRUD 화면, Prisma 스키마, NestJS 모듈 구조, REST 컨트롤러 40여 개.
