import { ValidationError } from 'payload'

type ReviewData = Record<string, any>

export const validatePublish = async ({ data, originalDoc }: { data?: ReviewData; originalDoc?: ReviewData }) => {
  const doc = { ...(originalDoc ?? {}), ...(data ?? {}) } as ReviewData
  const nextData = data ?? {}

  // The form uses a shared default unit. Normalize the stay type so its
  // public metadata never says “months used” for a hotel review.
  if (doc.type === 'stay' && doc.experienceUnit === 'month') nextData.experienceUnit = 'night'

  if (doc._status !== 'published') return nextData

  const errors: Array<{ path: string; message: string }> = []
  const fail = (path: string, message: string) => errors.push({ path, message })

  if (!doc.pros?.length) fail('pros', '장점을 최소 1개 입력해주세요.')
  if (!doc.cons?.length) fail('cons', '단점을 최소 1개 입력해주세요. 단점 없는 리뷰는 발행할 수 없습니다.')
  if (!doc.acquisitionType) fail('acquisitionType', '어떻게 얻은 경험인지 밝혀주세요.')
  if (!doc.experienceScale || doc.experienceScale < 1) fail('experienceScale', '경험 규모를 입력해주세요.')

  switch (doc.type) {
    case 'product':
      if (doc.experienceUnit !== 'month') fail('experienceUnit', '물건 리뷰는 사용 개월 단위여야 합니다.')
      if (!doc.totalCost) fail('totalCost', '구매가를 공개해주세요.')
      break
    case 'trip': {
      const trip = doc.tripDetail
      if (!doc.totalCost) fail('totalCost', '총경비 없이는 발행할 수 없습니다.')
      if (!trip?.nights || !trip?.days) fail('tripDetail.nights', '여행 기간을 입력해주세요.')
      if (!trip?.itinerary?.length) fail('tripDetail.itinerary', '일자별 동선을 최소 1일 입력해주세요.')
      const breakdown = trip?.costBreakdown
      const values = ['flight', 'stay', 'food', 'transit', 'etc']
        .map((key) => breakdown?.[key])
        .filter((value): value is number => typeof value === 'number')
      if (values.length && values.reduce((sum, value) => sum + value, 0) !== doc.totalCost) {
        fail('tripDetail.costBreakdown', '경비 내역 합계가 총경비와 다릅니다.')
      }
      break
    }
    case 'stay':
      if (!doc.stayDetail?.pricePerNight) fail('stayDetail.pricePerNight', '1박 요금을 공개해주세요.')
      if (!doc.stayDetail?.nights) fail('stayDetail.nights', '숙박일수를 입력해주세요.')
      break
    case 'place':
      if (!doc.totalCost && !doc.costNote) fail('totalCost', '지출 금액 또는 기준을 입력해주세요.')
      break
    case 'comparison': {
      const items = doc.comparison ?? []
      if (items.length < 2) fail('comparison', '비교 대상을 2개 이상 등록해주세요.')
      const picks = items.filter((item: ReviewData) => item.isPick).length
      if (picks !== 1) fail('comparison', '우리의 선택을 정확히 1개 지정해주세요.')
      break
    }
  }

  if (errors.length) throw new ValidationError({ errors })

  if (!doc.publishedAt) nextData.publishedAt = new Date().toISOString()
  if (doc.initialRating == null) nextData.initialRating = doc.rating
  if (!doc.excerpt) nextData.excerpt = doc.conclusion
  return nextData
}
