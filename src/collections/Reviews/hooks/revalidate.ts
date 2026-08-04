import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateReview = async ({ doc, previousDoc }: { doc: Record<string, any>; previousDoc?: Record<string, any> }) => {
  if (doc._status === 'published') {
    revalidateTag(`review:${doc.slug}`)
    revalidateTag('home')
    revalidatePath('/reviews')
  }

  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    revalidateTag(`review:${previousDoc.slug}`)
  }

  return doc
}
