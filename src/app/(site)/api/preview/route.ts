import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  const slug = url.searchParams.get('slug')
  const expectedSecret = process.env.PREVIEW_SECRET ?? process.env.PAYLOAD_SECRET

  if (!expectedSecret || secret !== expectedSecret || !slug) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  return NextResponse.redirect(new URL(`/reviews/${encodeURIComponent(slug)}?preview=true`, request.url))
}
