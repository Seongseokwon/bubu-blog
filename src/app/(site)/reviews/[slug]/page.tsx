import type { Metadata } from 'next'
import type { Review } from '../../../../../payload-types'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getDisplayExperienceUnit, getRelationName, getRelationSlug, getReviewBySlug, getReviewNavigation } from '@/lib/reviews'
import { ACQUISITION_LABEL, REPEAT_LABEL, SCALE_LABEL, TYPE_LABEL, UNIT_LABEL } from '@/lib/labels'

type ReviewPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled } = await draftMode()
  const review = await getReviewBySlug(slug, { draft: isEnabled })

  return {
    title: review ? `${review.title} | 둘의 기준` : '리뷰 | 둘의 기준',
    description: review?.excerpt ?? review?.conclusion
  }
}

export default async function ReviewPage({ params, searchParams }: ReviewPageProps) {
  const { slug } = await params
  const { preview } = await searchParams
  const { isEnabled } = await draftMode()
  const isPreview = isEnabled && preview === 'true'
  const review = await getReviewBySlug(slug, { draft: isPreview })

  if (!review) notFound()

  const categoryName = getRelationName(review.category)
  const typeLabel = TYPE_LABEL[review.type]
  const repeatLabel = REPEAT_LABEL[review.type]
  const stayDetail = review.type === 'stay' ? review.stayDetail : undefined
  const experienceUnit = getDisplayExperienceUnit(review)
  const categorySlug = getRelationSlug(review.category)
  const navigation = await getReviewNavigation(review.slug, categorySlug)
  const tags = review.tags?.filter(
    (tag): tag is Exclude<NonNullable<Review['tags']>[number], number> =>
      typeof tag === 'object' && tag !== null && 'slug' in tag && 'name' in tag
  ) ?? []

  return (
    <main className="review-detail-page">
      <header className="foundation-header">
        <Link href="/" className="foundation-brand">둘의 기준</Link>
        <Link href="/" className="detail-back-link">모든 리뷰</Link>
      </header>

      <article className="review-article">
        {isPreview ? <div className="preview-banner">DRAFT PREVIEW · 아직 발행되지 않은 내용입니다.</div> : null}
        <div className={`review-detail-art review-art-${review.fallbackArt ?? 'hotel'}`} aria-hidden="true">
          <span>{typeLabel || 'REVIEW'}</span>
        </div>

        <div className="review-detail-heading">
          <div className="review-card-meta">
            <span>{categoryName ?? '라이프스타일'}</span>
            <span>{review.publishedAt ? new Date(review.publishedAt).toLocaleDateString('ko-KR') : '최근 기록'}</span>
          </div>
          <h1>{review.title}</h1>
          <p className="review-conclusion">{review.conclusion}</p>
        </div>

        <dl className="review-facts">
          <div><dt>평점</dt><dd>{review.rating.toFixed(1)} / 5</dd></div>
          <div><dt>{SCALE_LABEL[review.type]}</dt><dd>{review.experienceScale}{UNIT_LABEL[experienceUnit]}</dd></div>
          <div><dt>이용 경로</dt><dd>{ACQUISITION_LABEL[review.acquisitionType]}</dd></div>
          {stayDetail ? <div><dt>숙박</dt><dd>{stayDetail.nights}박 · {stayDetail.pricePerNight.toLocaleString('ko-KR')}원/박</dd></div> : null}
        </dl>

        {tags.length ? (
          <div className="review-tags" aria-label="리뷰 태그">
            {tags.map((tag) => <Link href={`/reviews?tag=${encodeURIComponent(tag.slug)}`} key={tag.id}>#{tag.name}</Link>)}
          </div>
        ) : null}

        <div className="review-body">
          <RichText data={review.content} />
        </div>

        <div className="review-pros-cons">
          <section>
            <p className="foundation-eyebrow">GOOD TO KNOW</p>
            <h2>좋았던 점</h2>
            <ul>{review.pros?.map((item) => <li key={item.id ?? item.text}>{item.text}</li>)}</ul>
          </section>
          <section>
            <p className="foundation-eyebrow">KEEP IN MIND</p>
            <h2>아쉬웠던 점</h2>
            <ul>{review.cons?.map((item) => <li key={item.id ?? item.text}>{item.text}</li>)}</ul>
          </section>
        </div>

        {review.wouldRepeat ? <p className="repeat-note">{repeatLabel}</p> : null}

        {navigation.related.length ? (
          <section className="related-reviews" aria-labelledby="related-reviews-title">
            <div className="section-heading">
              <div>
                <p className="foundation-eyebrow">READ NEXT</p>
                <h2 id="related-reviews-title">같은 주제의 리뷰</h2>
              </div>
              <Link href={`/reviews${categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ''}`}>카테고리 전체 보기</Link>
            </div>
            <div className="review-grid">
              {navigation.related.map((related) => (
                <Link className="review-card" href={`/reviews/${related.slug}`} key={related.id}>
                  <div className={`review-card-art review-art-${related.fallbackArt ?? 'hotel'}`} aria-hidden="true"><span>REVIEW</span></div>
                  <div className="review-card-body"><h3>{related.title}</h3><p>{related.conclusion}</p></div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {(navigation.previous || navigation.next) ? (
          <nav className="review-pagination" aria-label="리뷰 이동">
            {navigation.previous ? <Link href={`/reviews/${navigation.previous.slug}`}><small>이전 리뷰</small><strong>{navigation.previous.title}</strong></Link> : <span />}
            {navigation.next ? <Link href={`/reviews/${navigation.next.slug}`}><small>다음 리뷰</small><strong>{navigation.next.title}</strong></Link> : <span />}
          </nav>
        ) : null}
      </article>
    </main>
  )
}
