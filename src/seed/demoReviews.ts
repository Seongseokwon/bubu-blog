import config from '@payload-config'
import { getPayload } from 'payload'

type SeedRecord = { id: number; slug?: string }

const richText = (paragraphs: string[]) => ({
  root: {
    children: paragraphs.map((text) => ({
      children: [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1
    })),
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1
  }
})

async function ensureCategory(slug: string, name: string, description: string, order: number) {
  const existing = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0] as SeedRecord
  return payload.create({ collection: 'categories', data: { slug, name, description, order } as never }) as Promise<SeedRecord>
}

async function ensureTag(slug: string, name: string, kind: 'experience' | 'situation' | 'scale') {
  const existing = await payload.find({ collection: 'tags', where: { slug: { equals: slug } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0] as SeedRecord
  return payload.create({ collection: 'tags', data: { slug, name, kind } as never }) as Promise<SeedRecord>
}

async function upsertReview(slug: string, data: Record<string, unknown>) {
  const existing = await payload.find({ collection: 'reviews', where: { slug: { equals: slug } }, limit: 1 })

  if (existing.docs[0]) {
    return payload.update({ collection: 'reviews', id: existing.docs[0].id, data: data as never, draft: false })
  }

  return payload.create({ collection: 'reviews', data: data as never, draft: false })
}

const payload = await getPayload({ config })
const now = new Date().toISOString()

const stay = await ensureCategory('stay', '숙소와 휴식', '다시 머물고 싶은 숙소와 휴식 공간', 0)
const appliances = await ensureCategory('appliances', '가전', '일상을 편하게 만든 가전 리뷰', 1)
const food = await ensureCategory('food', '맛집', '직접 방문한 식당과 음식 경험', 2)

const repeat = await ensureTag('would-repeat', '다시 할 의향 있음', 'experience')
const twoPeople = await ensureTag('two-person-household', '2인 가구', 'situation')
const valueFirst = await ensureTag('value-first', '가성비 우선', 'situation')
const longTerm = await ensureTag('long-term', '오래 쓰는 제품', 'situation')

await upsertReview('demo-busan-stay', {
  type: 'stay',
  title: '부산 해변 근처 2박 숙소',
  slug: 'demo-busan-stay',
  conclusion: '걸어서 바다를 볼 수 있고, 둘이 쉬기에 충분히 조용한 숙소였습니다.',
  content: richText([
    '주말에 둘이 부산으로 떠나 해변에서 가까운 숙소에 2박 머물렀습니다.',
    '체크인 동선이 단순했고 객실은 사진보다 차분한 분위기였습니다. 늦은 밤에도 주변이 조용해 휴식에 집중하기 좋았습니다.'
  ]),
  category: stay.id,
  tags: [repeat.id, twoPeople.id],
  acquisitionType: 'booking',
  experienceScale: 2,
  experienceUnit: 'night',
  rating: 4.6,
  pros: [{ text: '해변까지 도보로 이동할 수 있다' }, { text: '밤에 조용하고 침구가 편안하다' }],
  cons: [{ text: '주차 공간이 넉넉하지 않다' }],
  stayDetail: { nights: 2, pricePerNight: 180000, roomType: '스탠다드 더블' },
  fallbackArt: 'hotel',
  isFeatured: true,
  publishedAt: now,
  _status: 'published'
})

await upsertReview('demo-dishwasher', {
  type: 'product',
  title: '식기세척기 6개월 사용기',
  slug: 'demo-dishwasher',
  conclusion: '설거지 시간을 줄여주지만 설치 공간과 소음은 미리 확인해야 합니다.',
  content: richText([
    '맞벌이 생활에서 가장 자주 미뤄지던 일이 설거지였습니다. 식기세척기를 6개월 동안 매일 사용해봤습니다.',
    '저녁 식사 후 바로 넣어두면 다음 날 아침에 정리할 수 있어 생활 리듬이 한결 가벼워졌습니다.'
  ]),
  category: appliances.id,
  tags: [twoPeople.id, longTerm.id],
  acquisitionType: 'purchase',
  experienceScale: 6,
  experienceUnit: 'month',
  totalCost: 890000,
  rating: 4.2,
  pros: [{ text: '저녁 설거지 시간이 크게 줄어든다' }, { text: '기름기 있는 식기도 깔끔하다' }],
  cons: [{ text: '작동 중 소리가 조금 크다' }],
  fallbackArt: 'dishwasher',
  publishedAt: now,
  _status: 'published'
})

await upsertReview('demo-pasta-place', {
  type: 'place',
  title: '주말에 다시 간 작은 파스타집',
  slug: 'demo-pasta-place',
  conclusion: '예약 없이 방문하기보다 이른 저녁에 가면 만족도가 높은 동네 식당입니다.',
  content: richText([
    '집 근처에서 가볍게 식사할 곳을 찾다가 방문했습니다. 메뉴가 많지 않아 주문이 빠르고 음식의 온도가 좋았습니다.',
    '둘이 방문해 파스타와 샐러드를 나눠 먹었고, 다음에는 평일 저녁에 다시 방문해보기로 했습니다.'
  ]),
  category: food.id,
  tags: [repeat.id, valueFirst.id],
  acquisitionType: 'visit',
  experienceScale: 2,
  experienceUnit: 'person',
  totalCost: 38000,
  costNote: '2인 기준',
  rating: 4.5,
  pros: [{ text: '음식이 빠르게 나오고 간이 과하지 않다' }, { text: '2인 식사 비용이 부담스럽지 않다' }],
  cons: [{ text: '좌석 간 간격이 좁다' }],
  wouldRepeat: true,
  fallbackArt: 'food',
  publishedAt: now,
  _status: 'published'
})

console.log('Created demo reviews: demo-busan-stay, demo-dishwasher, demo-pasta-place')
process.exit(0)
