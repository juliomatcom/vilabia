import type { MetadataRoute } from 'next';
import { GAMES } from '@/lib/application/games';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vilabia.es';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: 'monthly', priority: 1 },
    {
      url: `${SITE_URL}/formas-de-la-boca`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    { url: `${SITE_URL}/juegos`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    ...GAMES.map((game) => ({
      url: `${SITE_URL}/juegos/${game.slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];
}
