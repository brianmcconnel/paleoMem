import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_Hebrew } from 'next/font/google';
import { HelpGuide } from '../components/HelpGuide';
import { ReadingHelpProvider } from '../components/ReadingHelpContext';
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
  icons: {
    icon: [{ url: '/paleoMem/icon.svg', type: 'image/svg+xml' }],
  },
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
    >
      <body className="min-h-full flex flex-col bg-[var(--pw-bg-app)] text-[var(--pw-text)]">
        <ReadingHelpProvider>
          {children}
          <HelpGuide />
        </ReadingHelpProvider>
      </body>
    </html>
  );
}
