import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type PageProps = Omit<Parameters<typeof RootPage>[0], 'config' | 'importMap'>

export const generateMetadata = ({ params, searchParams }: Parameters<typeof generatePageMetadata>[0]) =>
  generatePageMetadata({ config, params, searchParams })

export default function Page(props: PageProps) {
  return RootPage({ config, importMap, ...props })
}
