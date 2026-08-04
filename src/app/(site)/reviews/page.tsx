import Link from 'next/link'
import { ReviewCard } from '@/components/ReviewCard'
import { getPublishedReviews, getReviewCategories, getReviewTags } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

type ReviewsPageProps = {
  searchParams: Promise<{ category?: string; tag?: string }>
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const { category, tag } = await searchParams
  const [reviews, categories, tags] = await Promise.all([
    getPublishedReviews(30, { category, tag }),
    getReviewCategories(),
    getReviewTags()
  ])
  const selectedCategory = categories.find((item) => item.slug === category)
  const selectedTag = tags.find((item) => item.slug === tag)

  return (
    <main className="magazine-page reviews-list-page">
      <header className="foundation-header">
        <Link href="/" className="foundation-brand">둘의 기준</Link>
        <span>ALL REVIEW NOTES</span>
      </header>

      <section className="reviews-list-hero" aria-labelledby="reviews-title">
        <p className="foundation-eyebrow">REVIEW INDEX</p>
        <h1 id="reviews-title">우리의 모든 리뷰</h1>
        <p className="foundation-copy">직접 경험한 선택을 주제와 태그로 골라볼 수 있습니다.</p>
      </section>

      <nav className="review-filters" aria-label="리뷰 필터">
        <div className="filter-group">
          <strong>카테고리</strong>
          <div className="filter-links">
            <Link className={!category ? 'is-active' : ''} href="/reviews">전체</Link>
            {categories.map((item) => (
              <Link className={item.slug === category ? 'is-active' : ''} href={`/reviews?category=${encodeURIComponent(item.slug)}`} key={item.id}>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <strong>태그</strong>
          <div className="filter-links">
            {tags.map((item) => (
              <Link className={item.slug === tag ? 'is-active' : ''} href={`/reviews?tag=${encodeURIComponent(item.slug)}`} key={item.id}>
                #{item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <section className="review-section reviews-results" aria-labelledby="results-title">
        <div className="section-heading">
          <div>
            <p className="foundation-eyebrow">FILTERED NOTES</p>
            <h2 id="results-title">{selectedCategory?.name ?? selectedTag?.name ?? '전체 리뷰'}</h2>
          </div>
          <span>{reviews.length}개의 기록</span>
        </div>
        {reviews.length ? (
          <div className="review-grid">
            {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
        ) : (
          <div className="empty-reviews">
            <strong>조건에 맞는 공개 리뷰가 없습니다.</strong>
            <p>다른 카테고리나 태그를 선택해보세요.</p>
            <Link className="button button-secondary" href="/reviews">필터 초기화</Link>
          </div>
        )}
      </section>
    </main>
  )
}
