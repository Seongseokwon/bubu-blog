import { revalidatePath, revalidateTag } from 'next/cache'

const safelyRevalidate = (action: () => void) => {
  try {
    action()
  } catch (error) {
    // Payload seed scripts run outside Next's request context, where cache
    // invalidation has no static generation store to update.
    if (error instanceof Error && error.message.includes('static generation store missing')) return
    throw error
  }
}

export const revalidateReview = async ({ doc, previousDoc }: { doc: Record<string, any>; previousDoc?: Record<string, any> }) => {
  if (doc._status === 'published') {
    safelyRevalidate(() => revalidateTag(`review:${doc.slug}`))
    safelyRevalidate(() => revalidateTag('home'))
    safelyRevalidate(() => revalidatePath('/reviews'))
  }

  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    safelyRevalidate(() => revalidateTag(`review:${previousDoc.slug}`))
  }

  return doc
}
