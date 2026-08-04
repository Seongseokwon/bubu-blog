import type { CollectionConfig } from 'payload'
import { admins, adminsOrPublished } from '@/access'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'kind'] },
  access: { read: adminsOrPublished, create: admins, update: admins, delete: admins },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: '경험 방식', value: 'experience' },
        { label: '상황', value: 'situation' },
        { label: '규모', value: 'scale' }
      ]
    },
    { name: 'description', type: 'text', maxLength: 120 }
  ]
}
