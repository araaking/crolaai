// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ChatProvider } from '@/components/providers/ChatProvider'

const inter = Inter({ subsets: ['latin'] })

// Metadata dasar untuk aplikasi Anda
export const metadata: Metadata = {
  title: 'Chat App',
  description: 'A simple chat application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
