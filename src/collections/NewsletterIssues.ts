import type { CollectionConfig } from 'payload'
import { admins, adminsOrPublished } from '@/access'

export const NewsletterIssues: CollectionConfig = {
  slug: 'newsletter-issues',
  admin: { useAsTitle: 'subject', defaultColumns: ['subject', 'status', 'sentAt'] },
  access: { read: adminsOrPublished, create: admins, update: admins, delete: admins },
  fields: [
    { name: 'subject', type: 'text', required: true, maxLength: 120 },
    { name: 'previewText', type: 'text', maxLength: 180 },
    { name: 'body', type: 'richText', required: true },
    {
      name: 'status', type: 'select', required: true, defaultValue: 'draft',
      options: [{ label: '초안', value: 'draft' }, { label: '예약', value: 'scheduled' }, { label: '발송 완료', value: 'sent' }]
    },
    { name: 'scheduledAt', type: 'date' },
    { name: 'sentAt', type: 'date' }
  ]
}
