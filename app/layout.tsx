import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nanas Energy Invoice System',
  description: 'Invoice and voucher management',
  icons: {
    icon: '/logo.jpeg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
