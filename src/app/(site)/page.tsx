import Link from 'next/link'
import { ReviewCard } from '@/components/ReviewCard'
import { getPublishedReviews, getReviewCategories } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [reviews, categories] = await Promise.all([getPublishedReviews(), getReviewCategories()])

  return (
    <main className="magazine-page">
      <header className="foundation-header">
        <Link href="#main-content" className="foundation-brand">둘의 기준</Link>
        <span>OUR EVERYDAY STANDARD</span>
      </header>

      <section id="main-content" className="magazine-hero" aria-labelledby="page-title">
        <p className="foundation-eyebrow">REAL-LIFE REVIEWS</p>
        <h1 id="page-title">직접 경험한 선택을<br />차분하게 기록합니다.</h1>
        <p className="foundation-copy">
          둘이 직접 써보고, 머물고, 가본 것만 우리의 기준으로 남깁니다.
          좋은 점과 아쉬운 점을 함께 기록해 다음 선택에 도움이 되는 리뷰를 만듭니다.
        </p>
      </section>

      <section className="review-section" aria-labelledby="recent-reviews-title">
        <div className="section-heading">
          <div>
            <p className="foundation-eyebrow">LATEST NOTES</p>
            <h2 id="recent-reviews-title">최근 리뷰</h2>
          </div>
          <span>{reviews.length ? `${reviews.length}개의 기록` : '첫 기록을 준비 중'}</span>
        </div>

        {reviews.length ? (
          <div className="review-grid">
            {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
        ) : (
          <div className="empty-reviews">
            <strong>아직 공개된 리뷰가 없습니다.</strong>
            <p>관리자에서 리뷰를 작성하고 발행하면 이곳에 표시됩니다.</p>
            <Link className="button button-primary" href="/admin/collections/reviews/create">첫 리뷰 작성하기</Link>
          </div>
        )}
      </section>

      <section className="home-category-section" aria-labelledby="category-title">
        <div className="section-heading">
          <div>
            <p className="foundation-eyebrow">BROWSE BY TOPIC</p>
            <h2 id="category-title">관심 있는 주제부터</h2>
          </div>
          <Link href="/reviews">전체 리뷰 보기</Link>
        </div>
        <div className="category-links">
          {categories.map((category) => (
            <Link href={`/reviews?category=${encodeURIComponent(category.slug)}`} key={category.id}>
              <strong>{category.name}</strong>
              <span>{category.description ?? '직접 경험한 선택의 기록'}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
