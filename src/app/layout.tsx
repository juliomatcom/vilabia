import type { Metadata, Viewport } from 'next';
import { VoiceWarmup } from '@/components/voice';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vilabia.es';
const SITE_NAME = 'Vilabia';
const DESCRIPTION =
  'Vilabia es una plataforma de logopedia online con ejercicios de lectura labial gratuitos. Practica reconocer palabras leyendo los labios de un avatar animado: ideal como apoyo de un logopeda infantil o de adultos, y para personas con pérdida auditiva o hipoacusia.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: 'Vilabia — Logopeda online: ejercicios de lectura labial gratis',
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    'logopeda online',
    'ejercicios de logopedia',
    'ejercicios logopeda',
    'logopeda infantil',
    'lectura labial',
    'leer los labios',
    'entrenamiento auditivo',
    'pérdida auditiva',
    'hipoacusia',
    'sordera',
    'terapia del habla online',
  ],
  authors: [{ name: 'Julio César Martín', url: 'https://x.com/depre_cuba' }],
  creator: 'Julio César Martín',
  publisher: SITE_NAME,
  category: 'education',
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: '/', languages: { 'es-ES': '/' } },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: SITE_NAME,
    title: 'Vilabia — Logopeda online: ejercicios de lectura labial gratis',
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vilabia — Logopeda online: ejercicios de lectura labial gratis',
    description: DESCRIPTION,
    creator: '@depre_cuba',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: '#4eafb2',
  colorScheme: 'light',
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      founder: {
        '@type': 'Person',
        name: 'Julio César Martín',
        sameAs: 'https://x.com/depre_cuba',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'es-ES',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <VoiceWarmup />
        {children}
      </body>
    </html>
  );
}
