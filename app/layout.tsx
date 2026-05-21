import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { site } from '@/lib/content';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['opsz', 'SOFT'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.meta.siteUrl),
  title: {
    default: site.meta.title,
    template: `%s · ${site.brand.name}`,
  },
  description: site.meta.description,
  keywords: [
    'médico São José do Rio Preto',
    'nutrologia esportiva',
    'medicina baseada em evidência',
    'psiquiatria',
    'consulta online',
    'Renato Sardinha',
    'medicina integrativa',
  ],
  authors: [{ name: site.brand.name }],
  creator: site.brand.name,
  openGraph: {
    type: 'website',
    locale: site.meta.locale,
    url: site.meta.siteUrl,
    title: site.meta.title,
    description: site.meta.description,
    siteName: site.brand.name,
    images: [{ url: site.meta.ogImage, width: 1200, height: 630, alt: site.brand.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.meta.title,
    description: site.meta.description,
    images: [site.meta.ogImage],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: site.meta.siteUrl },
};

export const viewport: Viewport = {
  themeColor: site.meta.themeColor,
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Physician',
  name: site.brand.name,
  image: `${site.meta.siteUrl}${site.hero.image}`,
  url: site.meta.siteUrl,
  telephone: site.contact.whatsapp,
  medicalSpecialty: ['Nutrition', 'Psychiatry', 'Sports Medicine'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.contact.city,
    addressRegion: site.contact.state,
    addressCountry: site.contact.country,
  },
  sameAs: [site.contact.instagramLink],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
