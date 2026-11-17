'use client';

import { useEffect } from 'react';
import { MicIcon, RefreshIcon } from '@/components/icons';
import {
  answer,
  createGame,
  redraw,
  setDifficultyOffset,
  type GameState,
} from '@/lib/application/games/adivina/game';
import { levelExaggeration } from '@/lib/application/games/adivina/level';
import { Tip } from '@/components/tip';
import { GameHeading } from '../shared/game-heading';
import { RoundStage, useRoundPlayer, useSeededGame } from '../shared/round-player';
import { SettingsPanel } from '../shared/settings-panel';
import { WordCard, type CardState } from '../shared/word-card';

const ANSWER_ADVANCE_MS = 1400;

const cardStateFor = (game: GameState, word: string): CardState => {
  if (game.phase === 'playing') return 'idle';
  if (word === game.round.target) return 'correct';
  if (word === game.pick) return 'wrong';
  return 'idle';
};

export const AdivinaScreen = () => {
  const [game, setGame] = useSeededGame(createGame);
  const player = useRoundPlayer(game.round, game.round.target, {
    exaggeration: levelExaggeration(game.level),
    difficultyOffset: game.difficultyOffset,
  });
  const { revealed } = player;

  useEffect(() => {
    if (game.phase === 'playing') return;
    const timer = setTimeout(() => setGame((current) => redraw(current)), ANSWER_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [game.phase, game.round, setGame]);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <GameHeading title="¡Adivina la palabra!" />

      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        <div className="w-full lg:flex-1">
          <RoundStage
            player={player}
            silencedLabel="Ahora mismo no hay voz para esta palabra"
            lockedHint="Para elegir una palabra, primero escucha a la logopeda."
          />

          <div className="relative mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {game.round.options.map((word, index) => (
              <WordCard
                key={word}
                word={word}
                state={cardStateFor(game, word)}
                tint={index}
                locked={!revealed}
                disabled={game.phase !== 'playing' || !revealed}
                onSelect={() => setGame((current) => answer(current, word))}
              />
            ))}
            <button
              type="button"
              onClick={() => setGame((current) => redraw(current))}
              aria-label="Nuevas palabras"
              className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink shadow-sm"
            >
              <RefreshIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <SettingsPanel
          genero="mujer"
          velocidad={player.velocidad}
          onVelocidadChange={player.setVelocidad}
          dificultad={game.difficultyOffset}
          onDificultadChange={(value) => setGame((current) => setDifficultyOffset(current, value))}
        />
      </div>

      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Disponible próximamente"
        className="mx-auto flex cursor-not-allowed items-center gap-2 rounded-full bg-surface px-6 py-3 text-sm font-semibold text-ink-soft/50 shadow-sm"
      >
        <MicIcon />
        Hablar palabra
      </button>

      <p className="mt-auto text-right text-sm font-semibold text-ink">Nivel: {game.level}</p>

      <Tip>Prueba sin sonido con el modo mudo para incrementar la dificultad.</Tip>
    </div>
  );
};
