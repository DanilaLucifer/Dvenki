import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dvenki - Платформа для создания журналов',
  description: 'Создавайте и ведите персональные журналы по расписанию',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <SupabaseProvider>
          {children}
          <Toaster position="top-right" />
        </SupabaseProvider>
      </body>
    </html>
  )
}
