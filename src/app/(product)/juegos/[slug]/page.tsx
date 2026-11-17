import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GAMES, gameBySlug } from '@/lib/application/games';
import { GAME_SCREENS } from './screens';

export const dynamicParams = false;

export function generateStaticParams() {
  return GAMES.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: PageProps<'/juegos/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const game = gameBySlug(slug);
  if (!game) return {};
  return {
    title: game.seo.title,
    description: game.seo.description,
    alternates: { canonical: `/juegos/${game.slug}` },
  };
}

export default async function GamePage({ params }: PageProps<'/juegos/[slug]'>) {
  const { slug } = await params;
  const Screen = GAME_SCREENS[slug];
  if (!Screen) notFound();
  return <Screen />;
}
