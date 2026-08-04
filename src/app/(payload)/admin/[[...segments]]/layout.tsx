import config from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import { importMap } from '../importMap'

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return RootLayout({ config, importMap, children })
}
