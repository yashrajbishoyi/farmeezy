import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { AuthProvider } from '@/lib/context/AuthContext';
import { LanguageProvider } from '@/lib/context/LanguageContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#14231C',
};

export const metadata: Metadata = {
  title: 'Farmeezy — Predictive Crop-Disease Intelligence',
  description: 'Proactive crop disease prediction, outbreak simulation, and economic intelligence platform for Indian agriculture.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Farmeezy',
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Farmeezy" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1800&q=85"
          fetchPriority="high"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[#F5F4F0] text-[#14231C] font-sans antialiased flex flex-col selection:bg-[#1F3A2E] selection:text-white pb-20 md:pb-0">
        <AuthProvider>
          <LanguageProvider>
            <DemoBanner />
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <BottomNav />
            <PWAInstallPrompt />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
