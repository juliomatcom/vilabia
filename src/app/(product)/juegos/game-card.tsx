import Link from 'next/link';
import { PlayIcon } from '@/components/icons';
import type { GameMeta } from '@/lib/application/games';
import { GamePreview } from './game-previews';

export const GameCard = ({ game }: { readonly game: GameMeta }) => (
  <Link
    href={`/juegos/${game.slug}`}
    className="flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-lg transition-shadow hover:shadow-xl"
  >
    <h2 className="text-center text-lg font-bold tracking-wide text-ink uppercase">{game.name}</h2>
    <GamePreview slug={game.slug} />
    <p className="text-sm text-ink-soft">{game.tagline}</p>
    <span className="mt-auto inline-flex items-center gap-2 self-end rounded-full bg-brand px-5 py-2 text-sm font-semibold tracking-wide text-white uppercase">
      <PlayIcon className="h-4 w-4" />
      Jugar
    </span>
  </Link>
);
