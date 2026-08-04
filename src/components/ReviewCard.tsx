import Link from 'next/link'
import type { Review } from '../../payload-types'
import { getDisplayExperienceUnit, getRelationName } from '@/lib/reviews'
import { TYPE_LABEL, UNIT_LABEL } from '@/lib/labels'

export function ReviewCard({ review }: { review: Review }) {
  const categoryName = getRelationName(review.category)
  const typeLabel = TYPE_LABEL[review.type]
  const unitLabel = UNIT_LABEL[getDisplayExperienceUnit(review)]

  return (
    <Link className="review-card" href={`/reviews/${review.slug}`}>
      <div className={`review-card-art review-art-${review.fallbackArt ?? 'hotel'}`} aria-hidden="true">
        <span>{typeLabel || 'REVIEW'}</span>
      </div>
      <div className="review-card-body">
        <div className="review-card-meta">
          <span>{categoryName || typeLabel || '라이프스타일'}</span>
          <span>{review.rating.toFixed(1)} / 5</span>
        </div>
        <h3>{review.title}</h3>
        <p>{review.conclusion}</p>
        <small>{review.experienceScale}{unitLabel}</small>
      </div>
    </Link>
  )
}
