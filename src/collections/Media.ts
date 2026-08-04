import type { CollectionConfig } from 'payload'
import { admins } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'] },
  access: { read: () => true, create: admins, update: admins, delete: admins },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'thumb', width: 200, height: 200, position: 'centre' },
      { name: 'card', width: 800 },
      { name: 'cover', width: 1600 }
    ],
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 82 } }
  },
  fields: [
    { name: 'alt', type: 'text', required: true, admin: { description: '스크린리더용 설명' } },
    { name: 'credit', type: 'text', label: '출처' }
  ]
}
