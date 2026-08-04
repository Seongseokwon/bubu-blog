export const ACQUISITION_LABEL = {
  purchase: '직접 구매',
  booking: '직접 예약',
  visit: '직접 방문',
  gifted: '선물받음',
  rental: '렌탈',
  sponsored: '협찬',
  invited: '초대'
} as const

export const UNIT_LABEL = {
  month: '개월 사용',
  night: '박 숙박',
  day: '일 여행',
  person: '인 식사',
  visit_count: '회 방문'
} as const

export const TYPE_LABEL = {
  product: '',
  trip: '여행 일정',
  stay: '숙소 리뷰',
  place: '여행지·맛집',
  comparison: '비교'
} as const

export const REPEAT_LABEL = {
  product: '다시 구매할 의향 있음',
  trip: '다시 갈 의향 있음',
  stay: '다시 묵을 의향 있음',
  place: '다시 방문할 의향 있음',
  comparison: '다시 선택할 의향 있음'
} as const

export const isSponsored = (review: { acquisitionType?: string }) =>
  review.acquisitionType === 'sponsored' || review.acquisitionType === 'invited'
