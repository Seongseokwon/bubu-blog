import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { AffiliateClicks } from '@/collections/AffiliateClicks'
import { AffiliateLinks } from '@/collections/AffiliateLinks'
import { Categories } from '@/collections/Categories'
import { Comments } from '@/collections/Comments'
import { Media } from '@/collections/Media'
import { NewsletterIssues } from '@/collections/NewsletterIssues'
import { Reviews } from '@/collections/Reviews'
import { Subscribers } from '@/collections/Subscribers'
import { Tags } from '@/collections/Tags'
import { Users } from '@/collections/Users'
import { SiteSettings } from '@/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: { user: Users.slug },
  collections: [
    Reviews,
    Categories,
    Tags,
    Media,
    Users,
    Comments,
    Subscribers,
    NewsletterIssues,
    AffiliateLinks,
    AffiliateClicks
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? 'development-only-secret-change-me',
  sharp,
  typescript: { outputFile: path.resolve(dirname, '../payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI ?? 'postgres://postgres:postgres@localhost:5432/dul_ui_gijun' }
  }),
  plugins: [
    seoPlugin({ collections: ['reviews'] }),
    nestedDocsPlugin({ collections: ['reviews'] }),
    redirectsPlugin({ collections: ['categories'] }),
    s3Storage({
      collections: { media: { prefix: 'media' } },
      bucket: process.env.R2_BUCKET ?? 'dul-ui-gijun-media',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? ''
        },
        endpoint: process.env.R2_ENDPOINT,
        region: 'auto'
      }
    })
  ]
})
