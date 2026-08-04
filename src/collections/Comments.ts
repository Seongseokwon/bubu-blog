import type { CollectionConfig } from 'payload'
import { admins, authenticatedOrPublished } from '@/access'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: { useAsTitle: 'body', defaultColumns: ['body', 'review', 'author', 'status'] },
  access: {
    read: authenticatedOrPublished,
    create: ({ req: { user } }) => Boolean(user && !user.isBlocked),
    update: ({ req: { user } }) => user?.role === 'admin' || { author: { equals: user?.id } },
    delete: ({ req: { user } }) => user?.role === 'admin' || { author: { equals: user?.id } }
  },
  fields: [
    { name: 'review', type: 'relationship', relationTo: 'reviews', required: true, index: true },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true },
    { name: 'parent', type: 'relationship', relationTo: 'comments' },
    { name: 'body', type: 'textarea', required: true, maxLength: 1000 },
    {
      name: 'status', type: 'select', defaultValue: 'published',
      options: ['published', 'pending', 'hidden', 'deleted'].map((value) => ({ label: value, value }))
    },
    { name: 'reportCount', type: 'number', defaultValue: 0 }
  ]
}
