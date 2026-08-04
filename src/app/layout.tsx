import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: '둘의 기준 | 직접 경험한 라이프스타일 리뷰 매거진',
  description: '직접 써보고, 직접 가보고, 직접 경험한 우리의 선택들을 기록합니다.'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
