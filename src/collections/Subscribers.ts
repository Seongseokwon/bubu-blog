import type { CollectionConfig } from 'payload'
import { admins } from '@/access'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'status', 'confirmedAt', 'createdAt'] },
  access: { read: admins, create: () => true, update: admins, delete: admins },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    {
      name: 'status', type: 'select', required: true, defaultValue: 'pending',
      options: [{ label: '대기', value: 'pending' }, { label: '확인', value: 'confirmed' }, { label: '해지', value: 'unsubscribed' }]
    },
    { name: 'confirmationToken', type: 'text', unique: true, admin: { hidden: true } },
    { name: 'confirmedAt', type: 'date' },
    { name: 'unsubscribedAt', type: 'date' }
  ]
}
