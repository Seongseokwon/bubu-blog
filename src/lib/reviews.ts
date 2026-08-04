import config from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import type { Review } from '../../payload-types'

const publishedReviewWhere = {
  _status: { equals: 'published' as const }
}

type ReviewFilters = {
  category?: string
  tag?: string
}

type ReviewQueryOptions = ReviewFilters & {
  draft?: boolean
}

export async function getPublishedReviews(limit = 6, filters: ReviewFilters = {}): Promise<Review[]> {
  const payload = await getPayload({ config })
  const conditions: Where[] = [publishedReviewWhere]

  if (filters.category) conditions.push({ 'category.slug': { equals: filters.category } } as Where)
  if (filters.tag) conditions.push({ 'tags.slug': { equals: filters.tag } } as Where)

  const { docs } = await payload.find({
    collection: 'reviews',
    depth: 1,
    limit,
    sort: '-publishedAt',
    where: conditions.length === 1 ? publishedReviewWhere : { and: conditions }
  })

  return docs as Review[]
}

export async function getReviewBySlug(slug: string, options: ReviewQueryOptions = {}): Promise<Review | null> {
  const payload = await getPayload({ config })
  const result = options.draft
    ? await payload.find({
        collection: 'reviews',
        draft: true,
        depth: 1,
        limit: 1,
        overrideAccess: true,
        where: { slug: { equals: slug } }
      })
    : await payload.find({
        collection: 'reviews',
        depth: 1,
        limit: 1,
        where: { and: [publishedReviewWhere, { slug: { equals: slug } }] as Where[] }
      })

  return (result.docs[0] as Review | undefined) ?? null
}

export async function getReviewCategories() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 50,
    sort: 'order'
  })

  return docs
}

export async function getReviewTags() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'tags',
    depth: 0,
    limit: 50,
    sort: 'name'
  })

  return docs
}

export function getRelationName(value: unknown) {
  if (typeof value !== 'object' || value === null || !('name' in value)) return null

  const name = (value as { name?: unknown }).name
  return typeof name === 'string' ? name : null
}

export function getRelationSlug(value: unknown) {
  if (typeof value !== 'object' || value === null || !('slug' in value)) return null

  const slug = (value as { slug?: unknown }).slug
  return typeof slug === 'string' ? slug : null
}

export async function getReviewNavigation(slug: string, categorySlug: string | null) {
  const reviews = await getPublishedReviews(50, categorySlug ? { category: categorySlug } : {})
  const currentIndex = reviews.findIndex((review) => review.slug === slug)

  return {
    next: currentIndex > 0 ? reviews[currentIndex - 1] : null,
    previous: currentIndex >= 0 ? reviews[currentIndex + 1] ?? null : null,
    related: reviews.filter((review) => review.slug !== slug).slice(0, 3)
  }
}

export function getDisplayExperienceUnit(review: Pick<Review, 'type' | 'experienceUnit'>) {
  return review.type === 'stay' ? 'night' : review.experienceUnit
}
