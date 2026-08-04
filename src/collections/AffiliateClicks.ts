import type { CollectionConfig } from 'payload'
import { admins } from '@/access'

export const AffiliateClicks: CollectionConfig = {
  slug: 'affiliate-clicks',
  admin: { useAsTitle: 'linkId', defaultColumns: ['linkId', 'createdAt'] },
  access: { read: admins, create: () => true, update: admins, delete: admins },
  fields: [
    { name: 'linkId', type: 'relationship', relationTo: 'affiliate-links', required: true },
    { name: 'referrer', type: 'text' },
    { name: 'userAgent', type: 'text' }
  ]
}
