'use client';

import type { ReactNode } from 'react';
import { CheckIcon, RefreshIcon } from '@/components/icons';
import { Tip } from '@/components/tip';
import type { ChoicePhase, ChoiceRound } from '@/lib/application/games/frases/shared';
import { GameHeading } from './game-heading';
import { WordCard, type CardState } from './word-card';

export const SentenceGameLayout = ({
  title,
  instruction,
  progress,
  settings,
  tip,
  credit,
  children,
}: {
  readonly title: string;
  readonly instruction: string;
  readonly progress: string;
  readonly settings: ReactNode;
  readonly tip: string;
  readonly credit: string;
  readonly children: ReactNode;
}) => (
  <div className="flex flex-1 flex-col gap-8">
    <GameHeading title={title}>
      <p className="max-w-xl text-base text-ink-soft">{instruction}</p>
    </GameHeading>

    <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
      <div className="w-full lg:flex-1">{children}</div>
      {settings}
    </div>

    <p className="mt-auto text-right text-sm font-semibold text-ink">{progress}</p>

    <Tip>{tip}</Tip>

    <p className="text-center text-xs text-ink-soft">Frases: {credit}.</p>
  </div>
);

const choiceCardState = (
  phase: ChoicePhase,
  round: ChoiceRound,
  pick: string | undefined,
  sentence: string,
): CardState => {
  if (phase === 'playing') return 'idle';
  if (sentence === round.target) return 'correct';
  if (sentence === pick) return 'wrong';
  return 'idle';
};

// One column at every width: a long sentence never shares a row and squeezes.
export const SentenceChoices = ({
  round,
  phase,
  pick,
  revealed,
  onPick,
}: {
  readonly round: ChoiceRound;
  readonly phase: ChoicePhase;
  readonly pick: string | undefined;
  readonly revealed: boolean;
  readonly onPick: (sentence: string) => void;
}) => (
  <div className="mt-8 grid grid-cols-1 gap-3 sm:gap-4">
    {round.options.map((sentence, index) => (
      <WordCard
        key={sentence}
        word={sentence}
        size="sentence"
        state={choiceCardState(phase, round, pick, sentence)}
        tint={index}
        dimmed={phase !== 'playing'}
        locked={!revealed}
        disabled={phase !== 'playing' || !revealed}
        onSelect={() => onPick(sentence)}
      />
    ))}
  </div>
);

export const AnswerFeedback = ({ phase }: { readonly phase: ChoicePhase }) =>
  phase === 'playing' ? null : (
    <p
      role="status"
      className={`mt-6 text-center text-lg font-bold ${
        phase === 'correct' ? 'text-correct-ink' : 'text-wrong-ink'
      }`}
    >
      {phase === 'correct' ? '¡Muy bien!' : 'Casi. La frase con ✓ es la que dijo.'}
    </p>
  );

export const FinishedPanel = ({
  message,
  onRestart,
}: {
  readonly message: string;
  readonly onRestart: () => void;
}) => (
  <div className="flex flex-col items-center gap-5 rounded-4xl border-2 border-correct-edge bg-correct px-6 py-10 text-center shadow-md">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-correct-edge text-white">
      <CheckIcon className="h-9 w-9" />
    </span>
    <p className="text-2xl font-black text-correct-ink">¡Lo has conseguido!</p>
    <p className="max-w-md text-base text-correct-ink">{message}</p>
    <button
      type="button"
      onClick={onRestart}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold tracking-wide text-white uppercase shadow-md hover:bg-brand-deep"
    >
      <RefreshIcon className="h-5 w-5" />
      Volver a empezar
    </button>
  </div>
);
