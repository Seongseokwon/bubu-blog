export const deriveAutoTags = async ({ data, req }: { data?: Record<string, any>; req: any }) => {
  if (!data?.wouldRepeat) return data

  const { docs } = await req.payload.find({
    collection: 'tags',
    where: { slug: { equals: 'would-repeat' } },
    limit: 1
  })
  const tagId = docs[0]?.id
  if (tagId && !data.tags?.includes(tagId)) data.tags = [...(data.tags ?? []), tagId]
  return data
}
