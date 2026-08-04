import type { CollectionConfig } from 'payload'
import { admins, adminsOrPublished } from '@/access'
import { deriveAutoTags } from './hooks/deriveAutoTags'
import { revalidateReview } from './hooks/revalidate'
import { validatePublish } from './hooks/validatePublish'

const typeOptions = [
  { label: '물건', value: 'product' },
  { label: '여행 일정', value: 'trip' },
  { label: '숙소', value: 'stay' },
  { label: '맛집·여행지', value: 'place' },
  { label: '비교', value: 'comparison' }
]

const acquisitionOptions = [
  { label: '직접 구매', value: 'purchase' },
  { label: '직접 예약', value: 'booking' },
  { label: '직접 방문', value: 'visit' },
  { label: '선물받음', value: 'gifted' },
  { label: '렌탈', value: 'rental' },
  { label: '협찬', value: 'sponsored' },
  { label: '초대', value: 'invited' }
]

const experienceUnitOptions = [
  { label: '개월 사용', value: 'month' },
  { label: '박 숙박', value: 'night' },
  { label: '일 여행', value: 'day' },
  { label: '인 식사', value: 'person' },
  { label: '회 방문', value: 'visit_count' }
]

const reviewTypeCondition = (type: string) => (data: Record<string, unknown>) => data?.type === type

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'category', '_status', 'publishedAt'],
    livePreview: {
      url: ({ data }) => {
        const secret = process.env.PREVIEW_SECRET ?? process.env.PAYLOAD_SECRET
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
        return `${baseUrl}/api/preview?secret=${encodeURIComponent(secret ?? '')}&slug=${encodeURIComponent(data.slug)}`
      }
    }
  },
  access: { read: adminsOrPublished, create: admins, update: admins, delete: admins },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 20 },
  hooks: {
    beforeValidate: [validatePublish],
    beforeChange: [deriveAutoTags],
    afterChange: [revalidateReview]
  },
  fields: [
    {
      name: 'type', type: 'select', required: true, defaultValue: 'product', options: typeOptions,
      admin: { position: 'sidebar' }
    },
    { name: 'title', type: 'text', required: true, maxLength: 100 },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' } },
    { name: 'conclusion', type: 'textarea', required: true, maxLength: 160, label: '한 줄 결론' },
    { name: 'content', type: 'richText', required: true },
    { name: 'excerpt', type: 'textarea', maxLength: 200, admin: { hidden: true } },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true, index: true },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true, index: true },
    {
      name: 'parent', type: 'relationship', relationTo: 'reviews', label: '상위 리뷰',
      admin: { hidden: true, condition: (data) => ['stay', 'place'].includes(String(data?.type)) }
    },
    {
      type: 'collapsible', label: '경험 정보', fields: [
        { name: 'subjectName', type: 'text', label: '대상 이름', admin: { hidden: true } },
        { name: 'brand', type: 'text', admin: { hidden: true } },
        { name: 'acquisitionType', type: 'select', required: true, label: '이용 경로', defaultValue: 'purchase', options: acquisitionOptions },
        { name: 'experiencedAt', type: 'date', admin: { hidden: true } },
        {
          type: 'row', fields: [
            { name: 'experienceScale', type: 'number', required: true, label: '기준 수치', defaultValue: 1, min: 1, admin: { width: '50%' } },
            { name: 'experienceUnit', type: 'select', required: true, label: '단위', defaultValue: 'month', options: experienceUnitOptions, admin: { width: '50%' } }
          ]
        },
        {
          type: 'row', fields: [
            { name: 'totalCost', type: 'number', label: '비용 (KRW)', min: 0, admin: { hidden: true, width: '60%' } },
            { name: 'costNote', type: 'text', maxLength: 60, admin: { hidden: true, width: '40%', placeholder: '2인 기준' } }
          ]
        },
        { name: 'vendor', type: 'text', label: '구매처 / 예약 플랫폼', admin: { hidden: true } },
        { name: 'wouldRepeat', type: 'checkbox', label: '다시 할 의향 있음', defaultValue: false }
      ]
    },
    {
      type: 'row', fields: [
        { name: 'rating', type: 'number', required: true, min: 0.5, max: 5, admin: { step: 0.1, width: '50%' } },
        { name: 'initialRating', type: 'number', min: 0.5, max: 5, admin: { hidden: true, step: 0.1, width: '50%', readOnly: true } }
      ]
    },
    {
      name: 'pros', type: 'array', minRows: 1, labels: { singular: '장점', plural: '장점' },
      fields: [{ name: 'text', type: 'text', required: true, maxLength: 80 }]
    },
    {
      name: 'cons', type: 'array', minRows: 1, labels: { singular: '단점', plural: '단점' },
      admin: { description: '단점 없이는 발행할 수 없습니다.' },
      fields: [{ name: 'text', type: 'text', required: true, maxLength: 80 }]
    },
    {
      name: 'scores', type: 'array', label: '재평가 이력', admin: { hidden: true },
      fields: [
        { name: 'score', type: 'number', required: true, min: 0.5, max: 5, admin: { step: 0.1 } },
        { name: 'scaleAtTime', type: 'number', required: true },
        { name: 'note', type: 'text', maxLength: 200 },
        { name: 'evaluatedAt', type: 'date', required: true }
      ]
    },
    {
      name: 'tripDetail', type: 'group', label: '여행 정보', admin: { condition: reviewTypeCondition('trip') },
      fields: [
        {
          type: 'row', fields: [
            { name: 'destination', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'countryCode', type: 'text', maxLength: 2, admin: { width: '50%' } }
          ]
        },
        {
          type: 'row', fields: [
            { name: 'nights', type: 'number', required: true, min: 1, admin: { width: '33%' } },
            { name: 'days', type: 'number', required: true, min: 1, admin: { width: '33%' } },
            { name: 'headcount', type: 'number', defaultValue: 2, min: 1, admin: { width: '33%' } }
          ]
        },
        {
          name: 'costBreakdown', type: 'group', label: '경비 내역 (KRW)',
          fields: [{ type: 'row', fields: [
            { name: 'flight', type: 'number', min: 0, admin: { width: '20%' } },
            { name: 'stay', type: 'number', min: 0, admin: { width: '20%' } },
            { name: 'food', type: 'number', min: 0, admin: { width: '20%' } },
            { name: 'transit', type: 'number', min: 0, admin: { width: '20%' } },
            { name: 'etc', type: 'number', min: 0, admin: { width: '20%' } }
          ] }]
        },
        {
          name: 'itinerary', type: 'array', label: '일자별 동선', minRows: 1,
          fields: [
            { name: 'day', type: 'number', required: true },
            { name: 'title', type: 'text', required: true },
            { name: 'places', type: 'array', fields: [{ name: 'name', type: 'text', required: true }] },
            { name: 'memo', type: 'textarea' }
          ]
        }
      ]
    },
    {
      name: 'stayDetail', type: 'group', label: '숙소 정보', admin: { condition: reviewTypeCondition('stay') },
      fields: [
        {
          type: 'row', fields: [
            { name: 'nights', type: 'number', required: true, min: 1, admin: { width: '50%' } },
            { name: 'pricePerNight', type: 'number', required: true, min: 0, admin: { width: '50%' } }
          ]
        },
        { name: 'roomType', type: 'text' },
        {
          type: 'row', fields: [
            { name: 'nearestStation', type: 'text', admin: { width: '60%' } },
            { name: 'walkMinutes', type: 'number', min: 0, admin: { width: '40%' } }
          ]
        },
        {
          type: 'row', fields: [
            { name: 'checkIn', type: 'text', admin: { width: '50%', placeholder: '15:00' } },
            { name: 'checkOut', type: 'text', admin: { width: '50%', placeholder: '11:00' } }
          ]
        },
        { name: 'address', type: 'text' },
        { name: 'location', type: 'point', admin: { hidden: true } }
      ]
    },
    {
      name: 'comparison', type: 'array', label: '비교 대상', minRows: 2,
      admin: { condition: reviewTypeCondition('comparison') },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'summary', type: 'text', maxLength: 120 },
        { name: 'isPick', type: 'checkbox', label: '우리의 선택' },
        {
          name: 'attributes', type: 'array', label: '비교 항목',
          fields: [{ type: 'row', fields: [
            { name: 'key', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'value', type: 'text', required: true, admin: { width: '60%' } }
          ] }]
        }
      ]
    },
    {
      name: 'coverImage', type: 'upload', relationTo: 'media',
      admin: { hidden: true, description: 'S3 연결 후 대표 이미지를 추가할 수 있습니다.' }
    },
    {
      name: 'fallbackArt', type: 'select', admin: { position: 'sidebar' },
      options: ['dishwasher', 'mattress', 'food', 'sofa', 'pan', 'laundry', 'suitcase', 'sapporo', 'hotel', 'onsen']
        .map((value) => ({ label: value, value })),
      defaultValue: 'hotel'
    },
    { name: 'isFeatured', type: 'checkbox', admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'viewCount', type: 'number', defaultValue: 0, admin: { hidden: true, position: 'sidebar', readOnly: true } },
    { name: 'monthlyViews', type: 'number', defaultValue: 0, admin: { hidden: true } }
  ]
}
