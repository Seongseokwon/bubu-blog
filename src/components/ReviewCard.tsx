import Link from 'next/link'
import type { Review } from '../../payload-types'
import { ACQUISITION_LABEL, TYPE_LABEL, UNIT_LABEL } from '@/lib/labels'
import { getDisplayExperienceUnit, getRelationName } from '@/lib/reviews'

type ReviewCardProps = {
  review: Review
  featured?: boolean
  travel?: boolean
}

export function ReviewCard({ review, featured = false, travel = false }: ReviewCardProps) {
  const categoryName = getRelationName(review.category) ?? TYPE_LABEL[review.type] ?? '라이프스타일'
  const unit = UNIT_LABEL[getDisplayExperienceUnit(review)]
  const art = review.fallbackArt ?? (travel ? 'sapporo' : 'hotel')
  const firstPro = review.pros?.[0]?.text
  const firstCon = review.cons?.[0]?.text
  const date = review.publishedAt ?? review.updatedAt

  if (travel) {
    return (
      <Link className={`travel-card travel-${art}`} href={`/reviews/${review.slug}`}>
        <span className="tag">{TYPE_LABEL[review.type] || categoryName}</span>
        <h3>{review.title}</h3>
        <p>{review.conclusion}</p>
        <span className="rating"><strong>{review.rating.toFixed(1)}</strong> / 5</span>
      </Link>
    )
  }

  return (
    <Link className={`review-card${featured ? ' featured' : ''}`} href={`/reviews/${review.slug}`}>
      <div className={`review-image review-art-${art}`} aria-hidden="true">
        <span className="review-image-label">실제 경험을 기준으로 기록</span>
      </div>
      <div className="review-body">
        <div className="review-meta">
          <span className="tag">{categoryName}</span>
          <span className="tag neutral">{ACQUISITION_LABEL[review.acquisitionType]}</span>
          <span className="tag neutral">{review.experienceScale}{unit}</span>
        </div>
        <h3>{review.title}</h3>
        <p className="review-conclusion">{review.conclusion}</p>
        {featured && (firstPro || firstCon) ? (
          <div className="review-pros-cons">
            {firstPro ? <div className="pros"><b>장점</b><span>{firstPro}</span></div> : null}
            {firstCon ? <div className="cons"><b>단점</b><span>{firstCon}</span></div> : null}
          </div>
        ) : null}
        <div className="review-footer">
          <span className="rating"><strong>{review.rating.toFixed(1)}</strong> / 5</span>
          <span className="updated">{date ? new Date(date).toLocaleDateString('ko-KR') : '최근 업데이트'}</span>
        </div>
      </div>
    </Link>
  )
}
