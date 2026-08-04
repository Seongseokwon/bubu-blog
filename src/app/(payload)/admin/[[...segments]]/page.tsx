import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

export const generateMetadata = ({ params, searchParams }: Parameters<typeof generatePageMetadata>[0]) =>
  generatePageMetadata({ config, params, searchParams })

export default function Page(props: Parameters<typeof RootPage>[0]) {
  return RootPage({ config, importMap, ...props })
}
