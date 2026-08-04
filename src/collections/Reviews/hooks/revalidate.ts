import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidateReview = async ({ doc, previousDoc }: { doc: Record<string, any>; previousDoc?: Record<string, any> }) => {
  if (doc._status === 'published') {
    revalidateTag(`review:${doc.slug}`, 'max')
    revalidateTag('home', 'max')
    revalidatePath('/reviews')
  }

  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    revalidateTag(`review:${previousDoc.slug}`, 'max')
  }

  return doc
}
