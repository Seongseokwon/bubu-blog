import Link from 'next/link'
import { ReviewCard } from '@/components/ReviewCard'
import { SiteHeader } from '@/components/SiteHeader'
import { getPublishedReviews, getReviewCategories, getRelationName } from '@/lib/reviews'

export const dynamic = 'force-dynamic'

const principles = [
  ['01', '직접 사용한 것만', '직접 사용하지 않은 제품은 사용 후기처럼 작성하지 않습니다.'],
  ['02', '단점을 숨기지 않기', '장점보다 먼저 떠오른 불편함도 구매 판단에 필요한 정보입니다.'],
  ['03', '가격과 기간 함께 기록', '구매 당시 가격과 실제 사용 기간을 함께 기록합니다.'],
  ['04', '시간이 지나면 업데이트', '처음의 설렘과 지금의 평가는 다를 수 있어 다시 평가합니다.'],
  ['05', '광고보다 경험 우선', '후원 여부가 아니라 실제로 살아본 시간을 기준으로 기록합니다.']
]

function formatMonth(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 7).replace('-', '.') : '준비 중'
}

export default async function HomePage() {
  const [reviews, categories] = await Promise.all([
    getPublishedReviews(18),
    getReviewCategories()
  ])
  const featured = reviews[0]
  const sideReviews = reviews.slice(1, 3)
  const travelReviews = reviews.filter((review) => ['trip', 'stay', 'place'].includes(review.type)).slice(0, 3)
  const longReviews = reviews.filter((review) => review.experienceScale >= 6).slice(0, 3)
  const latestReviews = reviews.slice(3, 9)
  const directReviews = reviews.filter((review) => ['purchase', 'booking', 'visit'].includes(review.acquisitionType)).length
  const longCount = reviews.filter((review) => review.experienceScale >= 3).length
  const latestDate = reviews
    .map((review) => review.publishedAt ?? review.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1)

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">본문으로 바로가기</a>
      <SiteHeader />

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Lifestyle review magazine</span>
              <h1 id="hero-title">직접 써보고,<br />직접 가보고,<br /><span>우리의 선택</span>을 기록합니다.</h1>
              <p>좋은 선택은 광고보다 직접 경험에서 나온다고 믿습니다. 물건을 사고, 공간을 예약하고, 둘이 다녀온 시간을 솔직하게 남깁니다.</p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="#reviews">최근 리뷰 보기 <span aria-hidden="true">→</span></Link>
                <Link className="btn btn-secondary" href="#categories">카테고리 보기</Link>
              </div>
              <div className="hero-note"><span aria-hidden="true">✓</span> 광고보다 경험 · 후원보다 기록</div>
            </div>
            <div className="hero-visual" aria-label="햇살이 드는 차분한 신혼집을 표현한 이미지">
              <div className="hero-photo"><span className="photo-caption">A QUIET MORNING AT HOME / 08:12</span></div>
              <div className="floating-labels" aria-label="리뷰 신뢰 정보">
                <div className="floating-label">✓ 직접 구매</div>
                <div className="floating-label">◷ 6개월 사용</div>
                <div className="floating-label">✓ 재구매 의사 있음</div>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="리뷰 기준 지표">
          <div className="container">
            <dl className="trust-list">
              <div className="trust-item"><dt>직접 경험한 리뷰</dt><dd>{reviews.length}개</dd></div>
              <div className="trust-item"><dt>장기 사용·재방문 기록</dt><dd>{longCount}개</dd></div>
              <div className="trust-item"><dt>직접 비용 지불 비율</dt><dd>{reviews.length ? Math.round((directReviews / reviews.length) * 100) : 0}%</dd></div>
              <div className="trust-item"><dt>최종 업데이트</dt><dd>{formatMonth(latestDate)}</dd></div>
            </dl>
          </div>
        </section>

        <section className="section" id="categories" aria-labelledby="categories-title">
          <div className="container">
            <div className="section-heading"><div><span className="eyebrow">Explore the standard</span><h2 id="categories-title">무엇을 선택하기 전에<br />경험부터 찾아보세요.</h2></div><Link className="text-link" href="/reviews">전체 리뷰 보기 →</Link></div>
            <div className="category-grid">
              {categories.map((category) => (
                <Link className="category-card" href={`/reviews?category=${encodeURIComponent(category.slug)}`} key={category.id}>
                  <span className="category-icon" aria-hidden="true">✦</span>
                  <div><h3>{category.name}</h3><p>{category.description ?? '직접 경험한 선택의 기록'}</p></div>
                  <div className="category-foot">리뷰 보기 <span aria-hidden="true">→</span></div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {featured ? (
          <section className="section" id="reviews" aria-labelledby="popular-title">
            <div className="container">
              <div className="section-heading"><div><span className="eyebrow">Most read this month</span><h2 id="popular-title">이번 달 많이 읽은 리뷰</h2></div><p>구매 전에 궁금한 결론과, 사용 뒤에야 알게 된 단점을 카드에서 먼저 확인해보세요.</p></div>
              <div className="feature-grid">
                <ReviewCard review={featured} featured />
                <div className="feature-side">{sideReviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
              </div>
            </div>
          </section>
        ) : null}

        {longReviews.length ? (
          <section className="section longevity-section" aria-labelledby="longevity-title">
            <div className="container"><div className="longevity-wrap"><div className="section-heading"><div><span className="eyebrow">After the honeymoon period</span><h2 id="longevity-title">시간이 지나도 만족한 기록</h2></div><p>처음의 인상보다 실제로 오래 사용한 뒤의 평가를 보여드립니다.</p></div><div className="longevity-list">{longReviews.map((review) => <Link className="long-card" href={`/reviews/${review.slug}`} key={review.id}><div className="long-thumb"><div className={`review-image review-art-${review.fallbackArt ?? 'hotel'}`} /></div><div><h3>{review.title}</h3><p className="long-period">경험 기간 {review.experienceScale}{review.experienceUnit === 'month' ? '개월' : '회'}</p><div className="score-change">현재 {review.rating.toFixed(1)} / 5</div></div><span className="buy-again">✓ {review.wouldRepeat ? '다시 선택할 의향 있음' : '꼼꼼히 비교할 필요 있음'}</span></Link>)}</div></div></div>
          </section>
        ) : null}

        {travelReviews.length ? (
          <section className="travel-section" id="travel" aria-labelledby="travel-title">
            <div className="container"><div className="travel-intro"><div><span className="eyebrow">Travel, as we lived it</span><h2 id="travel-title">둘이 다녀온 여행</h2></div><p>직접 예약하고, 직접 다녀온 숙소와 여행지의 동선·총경비·다시 갈 의향을 기록합니다.</p></div><div className="travel-grid">{travelReviews.map((review) => <ReviewCard key={review.id} review={review} travel />)}</div></div>
          </section>
        ) : null}

        <section className="section" id="latest" aria-labelledby="latest-title">
          <div className="container"><div className="section-heading"><div><span className="eyebrow">Latest field notes</span><h2 id="latest-title">최근 리뷰</h2></div><p>집에서 매일 쓰는 물건부터 직접 예약한 숙소까지 같은 기준으로 기록합니다.</p></div><div className="recent-grid">{(latestReviews.length ? latestReviews : reviews).map((review) => <ReviewCard key={review.id} review={review} />)}</div></div>
        </section>

        <section className="section principles-section" id="principles" aria-labelledby="principles-title">
          <div className="container"><div className="section-heading"><div><span className="eyebrow">Our standard</span><h2 id="principles-title">이렇게 리뷰합니다</h2></div><p>생활이 바뀌는 선택일수록, 사용한 시간과 망설였던 지점을 함께 남깁니다.</p></div><div className="principles">{principles.map(([number, title, description]) => <article className="principle" key={number}><span className="principle-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></div>
        </section>
      </main>

      <section className="newsletter" id="newsletter" aria-labelledby="newsletter-title"><div className="container"><div className="newsletter-box"><div><span className="eyebrow">Slowly, honestly</span><h2 id="newsletter-title">오래 써본 뒤 달라진 평가를 기록합니다.</h2><p>새 제품 소개보다 3개월, 6개월, 1년 뒤의 실제 평가를 먼저 전해드릴게요.</p></div><Link className="btn btn-newsletter" href="/reviews">리뷰 둘러보기 →</Link></div></div></section>

      <footer className="site-footer"><div className="container"><div className="footer-main"><div className="footer-brand"><Link className="brand" href="/">둘의 기준<em>OUR EVERYDAY STANDARD</em></Link><p>직접 써보고, 직접 가보고,<br />우리의 선택을 기록합니다.</p></div><div className="footer-col"><h2>둘러보기</h2><Link href="/reviews">전체 리뷰</Link><Link href="#categories">카테고리</Link><Link href="#principles">리뷰 원칙</Link></div><div className="footer-col"><h2>기록</h2><Link href="#reviews">인기 리뷰</Link><Link href="#travel">여행 리뷰</Link><Link href="#latest">최근 리뷰</Link></div></div><div className="footer-bottom"><p className="disclosure">일부 글에는 제휴 링크가 포함될 수 있으며, 구매 시 일정액의 수수료를 받을 수 있습니다.</p><span>© 2026 둘의 기준. All rights reserved.</span></div></div></footer>
    </div>
  )
}
