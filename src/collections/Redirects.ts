import type { CollectionConfig } from 'payload'
import { admins } from '@/access'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: { useAsTitle: 'from', defaultColumns: ['from', 'to', 'statusCode'] },
  access: { read: () => true, create: admins, update: admins, delete: admins },
  fields: [
    { name: 'from', type: 'text', required: true, unique: true },
    { name: 'to', type: 'text', required: true },
    { name: 'statusCode', type: 'select', required: true, defaultValue: '301', options: [{ label: '301', value: '301' }, { label: '302', value: '302' }] }
  ]
}
