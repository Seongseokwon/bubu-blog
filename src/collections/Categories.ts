import type { CollectionConfig } from 'payload'
import { admins, adminsOrPublished } from '@/access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'reviewCount'] },
  access: { read: adminsOrPublished, create: admins, update: admins, delete: admins },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea', maxLength: 160 },
    { name: 'reviewCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'order', type: 'number', defaultValue: 0 }
  ]
}
