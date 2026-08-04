import type { Access } from 'payload'

export const admins: Access = ({ req }) => req.user?.role === 'admin'

export const adminsOrPublished: Access = ({ req }) => {
  if (req.user?.role === 'admin') return true
  return { _status: { equals: 'published' } }
}

export const authenticated: Access = ({ req }) => Boolean(req.user)

export const authenticatedOrPublished: Access = ({ req }) => {
  if (req.user) return true
  return { status: { equals: 'published' } }
}
