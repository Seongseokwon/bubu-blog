import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type PageProps = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

export const generateMetadata = ({ params, searchParams }: PageProps) =>
  generatePageMetadata({ config, params, searchParams })

export default function Page(props: PageProps) {
  return RootPage({ config, importMap, ...props })
}
