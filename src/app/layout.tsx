import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/Providers';
import Layout from '../components/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://pistonpeak.web.app'),
  title: 'PISTON PEAK | PREMIUM DIE-CAST REGISTRY',
  description: 'The ultimate registry for premium die-cast collectors. Discover, track, and trade high-detail die-cast models.',
  openGraph: {
    title: 'PISTON PEAK | PREMIUM DIE-CAST REGISTRY',
    description: 'The ultimate registry for premium die-cast collectors.',
    url: 'https://pistonpeak.web.app',
    siteName: 'Piston Peak',
    images: [
      {
        url: '/next.svg', // Replace with an actual OG image later
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PISTON PEAK | PREMIUM DIE-CAST REGISTRY',
    description: 'The ultimate registry for premium die-cast collectors.',
    images: ['/next.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
