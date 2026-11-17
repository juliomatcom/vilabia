'use client';

import { useEffect, useState } from 'react';
import { CheckIcon } from '@/components/icons';
import {
  clearSlots,
  createOrdena,
  isPlaced,
  lengthSteps,
  type LengthStep,
  nextOrdena,
  placeAndCheck,
  wordCount,
  slotMarks,
  startAt,
  tokenById,
  unplace,
  type OrdenaState,
  type WordRound,
} from '@/lib/application/games/frases/ordena';
import { phraseExaggeration, progressOf } from '@/lib/application/games/frases/shared';
import { RoundStage, useRoundPlayer, useSeededGame } from './round-player';
import { FinishedPanel, SentenceGameLayout } from './sentence-game';
import { SettingsPanel } from './settings-panel';

const CORRECT_ADVANCE_MS = 2400;
const CHIP_TINTS = ['bg-tile', 'bg-card-2', 'bg-card-3', 'bg-card-4'] as const;
const CHIP =
  'inline-flex min-h-14 min-w-14 items-center justify-center rounded-2xl px-4 py-2 text-xl font-bold shadow-sm transition';

const LengthPicker = ({
  steps,
  words,
  onSelect,
}: {
  readonly steps: readonly LengthStep[];
  readonly words: number;
  readonly onSelect: (level: number) => void;
}) => (
  <nav aria-label="Elige cuántas palabras" className="flex flex-col items-center gap-2">
    <span className="text-sm font-semibold text-ink-soft">Palabras por frase</span>
    <div className="flex flex-wrap justify-center gap-2">
      {steps.map((step) => (
        <button
          key={step.words}
          type="button"
          onClick={() => onSelect(step.level)}
          aria-pressed={step.words === words}
          aria-label={`Frases de ${step.words} palabras`}
          className={`min-w-12 cursor-pointer rounded-full px-3 py-2 text-base font-bold shadow-sm transition ${
            step.words === words ? 'bg-brand text-white' : 'bg-surface text-ink hover:bg-panel'
          }`}
        >
          {step.words}
        </button>
      ))}
    </div>
  </nav>
);

const Feedback = ({ game }: { readonly game: OrdenaState }) => {
  if (game.phase === 'correct')
    return (
      <p role="status" className="text-center text-lg font-bold text-correct-ink">
        ¡Muy bien! «{game.sentence}»
      </p>
    );
  if (game.phase === 'checked')
    return (
      <p role="status" className="text-center text-lg font-bold text-ink">
        {game.score} de {game.answer.length} palabras en su sitio. Las verdes ya están bien: coloca
        las demás.
      </p>
    );
  return null;
};

const Slots = ({
  game,
  onRemove,
}: {
  readonly game: OrdenaState;
  readonly onRemove: (slot: number) => void;
}) => {
  const marks = slotMarks(game);
  return (
    <ol
      aria-label="Tu frase"
      className="flex min-h-24 flex-wrap items-center justify-center gap-2 rounded-3xl border-2 border-edge bg-surface p-4 shadow-md"
    >
      {game.slots.map((id, slot) => {
        const word = id === undefined ? undefined : tokenById(game, id)?.text;
        const locked = game.locked.includes(slot);
        if (word === undefined)
          return (
            <li
              key={slot}
              aria-label={`Hueco ${slot + 1}, vacío`}
              className="h-14 w-16 rounded-2xl border-2 border-dashed border-edge bg-panel"
            />
          );
        return (
          <li key={slot}>
            <button
              type="button"
              onClick={() => onRemove(slot)}
              disabled={locked}
              aria-label={locked ? `${word}, bien colocada` : `Quitar ${word}`}
              className={`${CHIP} ${
                locked && marks[slot]
                  ? 'gap-1 border-2 border-correct-edge bg-correct text-correct-ink'
                  : 'cursor-pointer border-2 border-brand bg-white text-ink hover:-translate-y-0.5'
              }`}
            >
              {locked && <CheckIcon className="h-4 w-4" />}
              {word}
            </button>
          </li>
        );
      })}
    </ol>
  );
};

const Pile = ({
  game,
  locked,
  onPlace,
}: {
  readonly game: OrdenaState;
  readonly locked: boolean;
  readonly onPlace: (id: number) => void;
}) => (
  <ul aria-label="Palabras" className="flex min-h-14 flex-wrap justify-center gap-3">
    {game.shuffled.map((token, index) =>
      isPlaced(game, token.id) ? null : (
        <li key={token.id}>
          <button
            type="button"
            onClick={() => onPlace(token.id)}
            disabled={locked || game.phase === 'correct'}
            className={`${CHIP} ${CHIP_TINTS[index % CHIP_TINTS.length]} text-ink ${
              locked
                ? 'cursor-not-allowed opacity-55'
                : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg'
            }`}
          >
            {token.text}
          </button>
        </li>
      ),
    )}
  </ul>
);

export const WordOrderGame = ({
  rounds,
  title,
  instruction,
  tip,
  credit,
  finishedMessage,
}: {
  readonly rounds: readonly WordRound[];
  readonly title: string;
  readonly instruction: string;
  readonly tip: string;
  readonly credit: string;
  readonly finishedMessage: string;
}) => {
  const [game, setGame] = useSeededGame((rng) => createOrdena(rng, { rounds }));
  const [steps] = useState(() => lengthSteps(rounds.map((round) => round.sentence)));
  const player = useRoundPlayer(game.answer, game.sentence, {
    exaggeration: phraseExaggeration(
      progressOf(game.level - 1, rounds.length),
      game.difficultyOffset,
    ),
    difficultyOffset: game.difficultyOffset,
  });

  useEffect(() => {
    if (game.phase !== 'correct' || game.finished) return;
    const timer = setTimeout(
      () => setGame((current) => nextOrdena(current, Math.random, rounds)),
      CORRECT_ADVANCE_MS,
    );
    return () => clearTimeout(timer);
  }, [game.phase, game.finished, game.answer, rounds, setGame]);

  const hasLoose = game.slots.some((id, slot) => id !== undefined && !game.locked.includes(slot));

  return (
    <SentenceGameLayout
      title={title}
      instruction={instruction}
      progress={`Nivel: ${game.level} de ${rounds.length}`}
      tip={tip}
      credit={credit}
      settings={
        <SettingsPanel
          genero="mujer"
          velocidad={player.velocidad}
          onVelocidadChange={player.setVelocidad}
          dificultad={game.difficultyOffset}
          onDificultadChange={(value) =>
            setGame((current) => ({ ...current, difficultyOffset: value }))
          }
        />
      }
    >
      <div className="mb-6">
        <LengthPicker
          steps={steps}
          words={wordCount(game.sentence)}
          onSelect={(level) => setGame((current) => startAt(current, level, Math.random, rounds))}
        />
      </div>

      <RoundStage
        player={player}
        silencedLabel="Ahora mismo no hay voz para esta frase"
        lockedHint="Para ordenar las palabras, primero escucha a la logopeda."
      />

      <div className="mt-8 flex flex-col gap-6">
        <Slots game={game} onRemove={(slot) => setGame((current) => unplace(current, slot))} />
        <Feedback game={game} />

        {game.finished ? (
          <FinishedPanel
            message={finishedMessage}
            onRestart={() =>
              setGame((current) =>
                createOrdena(Math.random, { difficultyOffset: current.difficultyOffset, rounds }),
              )
            }
          />
        ) : (
          <>
            <Pile
              game={game}
              locked={!player.revealed}
              onPlace={(id) => setGame((current) => placeAndCheck(current, id, rounds))}
            />
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setGame((current) => clearSlots(current))}
                disabled={!hasLoose || game.phase === 'correct'}
                className="cursor-pointer rounded-full bg-surface px-6 py-3 text-base font-semibold text-ink shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Borrar
              </button>
            </div>
          </>
        )}
      </div>
    </SentenceGameLayout>
  );
};
