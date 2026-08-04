import type { CollectionConfig } from 'payload'
import { admins, adminsOrPublished } from '@/access'

export const AffiliateLinks: CollectionConfig = {
  slug: 'affiliate-links',
  admin: { useAsTitle: 'label', defaultColumns: ['label', 'network', 'review', 'active'] },
  access: { read: adminsOrPublished, create: admins, update: admins, delete: admins },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'url', type: 'text', required: true },
    { name: 'network', type: 'text' },
    { name: 'review', type: 'relationship', relationTo: 'reviews' },
    { name: 'active', type: 'checkbox', defaultValue: true }
  ]
}
