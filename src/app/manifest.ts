import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vilabia — Logopedia online y lectura labial',
    short_name: 'Vilabia',
    description:
      'Ejercicios gratuitos de lectura labial con un avatar animado. Apoyo de logopedia para niños y adultos, y para personas con pérdida auditiva.',
    start_url: '/',
    display: 'standalone',
    background_color: '#d7eff1',
    theme_color: '#4eafb2',
    lang: 'es-ES',
    categories: ['education', 'health', 'medical'],
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
