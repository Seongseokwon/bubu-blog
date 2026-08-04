'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function SiteHeader() {
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(saved ? saved === 'dark' : prefersDark)
  }, [])

  useEffect(() => {
    document.body.dataset.theme = dark ? 'dark' : 'light'
    window.localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="둘의 기준 홈">
          둘의 기준
          <em>OUR EVERYDAY STANDARD</em>
        </Link>

        <nav className={`primary-nav${menuOpen ? ' is-open' : ''}`} aria-label="주요 메뉴">
          <Link href="/reviews?category=living" onClick={() => setMenuOpen(false)}>생활</Link>
          <Link href="/reviews?category=appliances" onClick={() => setMenuOpen(false)}>가전</Link>
          <Link href="/reviews?category=stay" onClick={() => setMenuOpen(false)}>숙소</Link>
          <Link href="/reviews?category=travel" onClick={() => setMenuOpen(false)}>여행</Link>
          <Link href="/reviews?category=food" onClick={() => setMenuOpen(false)}>맛집</Link>
        </nav>

        <div className="header-actions">
          <button
            className="icon-btn theme-btn"
            type="button"
            aria-label={dark ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-pressed={dark}
            onClick={() => setDark((value) => !value)}
          >
            <span aria-hidden="true">{dark ? '☼' : '☾'}</span>
          </button>
          <Link className="header-review-link" href="/reviews">리뷰 보기</Link>
          <button
            className="icon-btn menu-btn"
            type="button"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
