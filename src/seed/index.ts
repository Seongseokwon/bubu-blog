import { getPayload } from 'payload'
import config from '@payload-config'

const categories = [
  ['가전', 'appliances', '식기세척기부터 청소기까지'],
  ['가구', 'furniture', '오래 사용할 가구만 기록합니다.'],
  ['생활용품', 'living', '실제로 사용한 생활의 도구'],
  ['여행', 'travel', '직접 다녀온 숙소와 여행지'],
  ['맛집', 'food', '직접 방문한 식당'],
  ['비교 콘텐츠', 'comparison', '선택지를 나란히 놓고 비교합니다.']
] as const

const tags = [
  ['다시 할 의향 있음', 'would-repeat', 'experience'],
  ['2인 가구', 'two-person-household', 'situation'],
  ['좁은 집', 'small-home', 'situation'],
  ['맞벌이 부부', 'dual-income', 'situation'],
  ['요리를 자주 하는 집', 'frequent-cooking', 'situation'],
  ['청소 시간을 줄이고 싶은 집', 'less-cleaning', 'situation'],
  ['가성비 우선', 'value-first', 'situation'],
  ['오래 쓰는 제품', 'long-term', 'situation']
] as const

async function upsert(collection: 'categories' | 'tags', slug: string, data: Record<string, unknown>) {
  const existing = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]
  return payload.create({ collection, data: { slug, ...data } as never })
}

const payload = await getPayload({ config })

for (const [name, slug, description] of categories) {
  await upsert('categories', slug, { name, description, order: categories.findIndex((item) => item[1] === slug) })
}

for (const [name, slug, kind] of tags) await upsert('tags', slug, { name, kind })

console.log('Seeded categories and tags.')
process.exit(0)
