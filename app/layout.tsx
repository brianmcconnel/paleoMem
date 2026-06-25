import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Noto_Sans_Hebrew } from 'next/font/google';
import { HelpGuide } from '../components/HelpGuide';
import { PwaRegister } from '../components/PwaRegister';
import { ReadingHelpProvider } from '../components/ReadingHelpContext';
import { ThemeProvider } from '../components/ThemeContext';
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
    icon: [{ url: pwaUrl('/icon.svg'), type: 'image/svg+xml' }],
    apple: [{ url: pwaUrl('/icons/icon-192.png'), sizes: '192x192', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f9fc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1118' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoHebrew.variable} h-full antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--pw-bg-app)] text-[var(--pw-text)]">
        <PwaRegister />
        <ThemeProvider>
          <ReadingHelpProvider>
            {children}
            <HelpGuide />
          </ReadingHelpProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
