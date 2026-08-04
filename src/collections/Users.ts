import type { CollectionConfig } from 'payload'
import { admins } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'nickname', defaultColumns: ['nickname', 'email', 'role', 'isBlocked'] },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || { id: { equals: user?.id } },
    create: () => true,
    update: ({ req: { user } }) => user?.role === 'admin' || { id: { equals: user?.id } },
    delete: admins,
    admin: ({ req: { user } }) => user?.role === 'admin'
  },
  fields: [
    { name: 'nickname', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'member',
      options: [{ label: '관리자', value: 'admin' }, { label: '회원', value: 'member' }],
      access: { update: ({ req }) => req.user?.role === 'admin' }
    },
    { name: 'avatarUrl', type: 'text' },
    { name: 'isBlocked', type: 'checkbox', defaultValue: false }
  ]
}
