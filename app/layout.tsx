import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
}

export const metadata: Metadata = {
  title: 'SwimTrackr | Intelligent Swim School Management Platform',
  description: 'SwimTrackr is revolutionizing how swim schools operate with intelligent progress tracking, streamlined class management, and powerful analytics.',
  keywords: 'swim school software, swim lesson management, swimmer progress tracking, swim school analytics, aquatic center management, swim instructor scheduling',
  authors: [{ name: 'SwimTrackr Team' }],
  creator: 'SwimTrackr',
  publisher: 'SwimTrackr',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://swimtrackr.app',
    siteName: 'SwimTrackr',
    title: 'SwimTrackr | Intelligent Swim School Management Platform',
    description: 'SwimTrackr is revolutionizing how swim schools operate with intelligent progress tracking, streamlined class management, and powerful analytics.',
    images: [
      {
        url: 'https://swimtrackr.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SwimTrackr - Swimming Progress Tracking Made Simple',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@SwimTrackr',
    creator: '@SwimTrackr',
    title: 'SwimTrackr | Intelligent Swim School Management Platform',
    description: 'SwimTrackr is revolutionizing how swim schools operate with intelligent progress tracking, streamlined class management, and powerful analytics.',
    images: ['https://swimtrackr.app/twitter-card.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 