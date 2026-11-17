import type { Metadata } from 'next';
import { GAMES } from '@/lib/application/games';
import { GameCard } from './game-card';

export const metadata: Metadata = {
  title: 'Juegos de lectura labial',
  description:
    'Elige un ejercicio de lectura labial de Vilabia. Cada juego entrena el reconocimiento de palabras leyendo los labios de un avatar animado, con dificultad progresiva.',
  alternates: { canonical: '/juegos' },
};

export default function Juegos() {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <h1 className="text-center text-2xl font-bold tracking-wide text-ink uppercase">
        Selección de juegos Vilabia
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {GAMES.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  );
}
