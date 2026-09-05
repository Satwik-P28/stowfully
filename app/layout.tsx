import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = 'https://stowfully.nex3sss.chatgpt.site';

export const metadata: Metadata = {
  title: 'Stowfully — Open-source visual memory vault, no account',
  description:
    'Free local-first visual bookmark vault and mymind alternative. Save links, notes, and images, search by tag, and export JSON — nothing is uploaded.',
  keywords: [
    'open source mymind alternative',
    'visual bookmarks',
    'local-first pkm',
    'private bookmark manager',
    'personal knowledge vault',
  ],
  authors: [{ name: 'Stowfully contributors' }],
  category: 'productivity',
  metadataBase: new URL(siteUrl),
  alternates: { canonical: siteUrl },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Stowfully — Keep what matters. Find it when it does.',
    description: 'A private, local-first visual memory vault for links, notes, and images.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stowfully — Keep what matters. Find it when it does.',
    description: 'A private, local-first visual memory vault for links, notes, and images.',
    images: ['/og.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Stowfully',
  applicationCategory: 'BrowserApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Local-first visual memory vault for links, notes, and images.',
  url: siteUrl,
  downloadUrl: 'https://github.com/Satwik-P28/stowfully',
  license: 'https://opensource.org/licenses/MIT',
  isAccessibleForFree: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
