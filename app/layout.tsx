import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Noto_Sans_Hebrew, Noto_Serif_Hebrew } from 'next/font/google';
import { HelpGuide } from '../components/HelpGuide';
import { InlineScript } from '../components/InlineScript';
import { PwaInstallPrompt } from '../components/PwaInstallPrompt';
import { PwaRegister } from '../components/PwaRegister';
import { PwaUpdatePrompt } from '../components/PwaUpdatePrompt';
import { ReadingHelpProvider } from '../components/ReadingHelpContext';
import { HebrewFontProvider } from '../components/HebrewFontContext';
import { ThemeProvider } from '../components/ThemeContext';
import { UserSettingsProvider } from '../components/UserSettingsContext';
import { pwaUrl } from '../lib/pwa';
import { THEME_BOOTSTRAP_SCRIPT } from '../lib/site-cookies';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const notoHebrew = Noto_Sans_Hebrew({
  variable: '--font-noto-hebrew',
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
});

const notoHebrewSerif = Noto_Serif_Hebrew({
  variable: '--font-noto-hebrew-serif',
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'paleoMem',
  description:
    'Side-by-side Hebrew + English scripture with Paleo-Hebrew pictographic letter analysis',
  applicationName: 'paleoMem',
  manifest: pwaUrl('/manifest.webmanifest'),
  appleWebApp: {
    capable: true,
    title: 'paleoMem',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: pwaUrl('/icon.svg'), type: 'image/svg+xml' },
      { url: pwaUrl('/icons/icon-192.png'), sizes: '192x192', type: 'image/png' },
      { url: pwaUrl('/icons/icon-512.png'), sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: pwaUrl('/apple-touch-icon.png'), sizes: '180x180', type: 'image/png' },
      { url: pwaUrl('/icons/icon-192.png'), sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#0b1118',
  colorScheme: 'dark light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoHebrew.variable} ${notoHebrewSerif.variable} h-full antialiased`}
      data-theme="dark"
      data-hebrew-font="modern"
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preload"
          href={pwaUrl('/fonts/Robo-PaleoHeb.ttf')}
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Greek:wght@400;500;700&display=swap"
        />
        <InlineScript html={THEME_BOOTSTRAP_SCRIPT} />
      </head>
      <body
        className="min-h-full flex flex-col bg-[var(--pw-bg-app)] text-[var(--pw-text)]"
        suppressHydrationWarning
      >
        <PwaRegister />
        <PwaInstallPrompt />
        <PwaUpdatePrompt />
        <ThemeProvider>
          <UserSettingsProvider>
            <HebrewFontProvider>
              <ReadingHelpProvider>
                {children}
                <HelpGuide />
              </ReadingHelpProvider>
            </HebrewFontProvider>
          </UserSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
