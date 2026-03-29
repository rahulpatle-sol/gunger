import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Special_Elite, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const specialElite = Special_Elite({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-special-elite',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'GUNGER — Code. Test. Dominate.', template: '%s | GUNGER' },
  description: 'The underground coding platform for junior devs. Submit code, pass hidden test cases, climb the leaderboard.',
  keywords: ['coding platform', 'test cases', 'leaderboard', 'judge0', 'competitive programming'],
  authors: [{ name: 'Gunger' }],
  openGraph: {
    title: 'GUNGER — Code. Test. Dominate.',
    description: 'Submit code. Pass hidden test cases. Earn XP. Dominate the leaderboard.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gunger.vercel.app',
    siteName: 'GUNGER',
    images: [{
      url: '/api/og',
      width: 1200,
      height: 630,
      alt: 'GUNGER Coding Platform',
    }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GUNGER — Code. Test. Dominate.',
    description: 'The underground coding platform for junior devs.',
    images: ['/api/og'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0D0B08',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${specialElite.variable} ${jetbrains.variable}`}
    >
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1612',
              color: '#F4ECD8',
              border: '1px solid rgba(244,236,216,0.2)',
              fontFamily: 'var(--font-special-elite)',
              fontSize: '14px',
              borderRadius: '0',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0D0B08' } },
            error: { iconTheme: { primary: '#C41E3A', secondary: '#0D0B08' } },
          }}
        />
      </body>
    </html>
  )
}
