import type { GlobalConfig } from 'payload'
import { admins } from '@/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true, update: admins },
  fields: [
    { name: 'heroTitle', type: 'textarea', required: true },
    { name: 'heroDescription', type: 'textarea', required: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'trustLabels', type: 'array', maxRows: 4,
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'metric', type: 'select', required: true,
          options: ['total', 'longTerm', 'directRatio', 'lastUpdated'].map((value) => ({ label: value, value }))
        }
      ]
    },
    {
      name: 'principles', type: 'array', maxRows: 5,
      fields: [{ name: 'title', type: 'text', required: true }, { name: 'description', type: 'textarea', required: true }]
    },
    { name: 'showTravelSection', type: 'checkbox', defaultValue: false, admin: { description: '여행 리뷰 3건 미만이면 꺼두세요.' } }
  ]
}
