const milestones = [
  ['Payload CMS', '콘텐츠 관리 기반'],
  ['5 review types', '물건·여행·숙소·장소·비교'],
  ['W1 ready', '스키마 구현 시작']
]

export default function HomePage() {
  return (
    <main className="foundation-page">
      <header className="foundation-header">
        <a href="#main-content" className="foundation-brand">둘의 기준</a>
        <span>OUR EVERYDAY STANDARD</span>
      </header>
      <section id="main-content" className="foundation-hero" aria-labelledby="page-title">
        <p className="foundation-eyebrow">W1 FOUNDATION</p>
        <h1 id="page-title">직접 경험한 선택을<br />쌓아갈 준비를 마쳤습니다.</h1>
        <p className="foundation-copy">
          Payload CMS와 PostgreSQL을 중심으로 리뷰·여행·숙소·맛집을 같은 기준으로 기록하는 기반을 구성했습니다.
          다음 단계에서 시안의 홈 화면을 실제 데이터와 연결합니다.
        </p>
        <div className="foundation-actions">
          <a href="#milestones" className="button button-primary">W1 구성 확인</a>
          <a href="#next" className="button button-secondary">다음 작업 보기</a>
        </div>
      </section>
      <section id="milestones" className="foundation-milestones" aria-label="W1 기반 구성">
        {milestones.map(([title, description]) => (
          <article key={title}>
            <strong>{title}</strong>
            <span>{description}</span>
          </article>
        ))}
      </section>
      <p id="next" className="foundation-next">다음 단계: Payload Admin 라우트와 PostgreSQL 연결 후 리뷰 5종의 시드 데이터를 입력합니다.</p>
    </main>
  )
}
