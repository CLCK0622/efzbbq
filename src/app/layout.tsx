import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { authConfig } from '@/lib/auth'
import { getServerSession } from 'next-auth/next'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '张江墙',
  description: '张江多功能墙 - 校园动态分享平台',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)

  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
