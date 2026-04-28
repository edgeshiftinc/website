import type { Metadata, Viewport } from 'next';
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { SITE } from '@/lib/data';

const syne = Syne({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

const dmSans = DM_Sans({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  weight: ['300', '400'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `Edgeshift Inc — Infrastructure Technology Partner`,
    template: `%s | Edgeshift Inc`,
  },
  description: 'Integrated technology partner delivering resilient, scalable digital solutions through custom software engineering, managed cloud DevOps, expert DBA support, and Network availability & observability.',
  keywords: [
    'managed IT services Canada',
    'DBA support Canada',
    'DevOps SecOps',
    'AI solutions enterprise',
    'network security managed services',
    'infrastructure observability',
    'Argus monitoring tool',
    'cloud engineering',
    'Edgeshift Inc',
    'service desk 24/7',
  ],
  authors: [{ name: SITE.fullName, url: SITE.url }],
  creator: SITE.fullName,
  openGraph: {
    type:        'website',
    locale:      'en_CA',
    url:         SITE.url,
    siteName:    SITE.fullName,
    title:       'Edgeshift Inc — Infrastructure Technology Partner',
    description: 'Integrated technology partner delivering resilient, scalable digital solutions through custom software engineering, managed cloud DevOps, expert DBA support, and Network availability & observability.',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Edgeshift Inc — Infrastructure Technology Partner',
    description: 'Integrated technology partner delivering resilient, scalable digital solutions through custom software engineering, managed cloud DevOps, expert DBA support, and Network availability & observability.',
  },
  robots: {
    index:     true,
    follow:    true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor:   '#ffffff',
  width:        'device-width',
  initialScale: 1,
};

// Prevents flash of wrong theme on page load
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}