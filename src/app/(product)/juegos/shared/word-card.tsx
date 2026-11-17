'use client';

import { CheckIcon } from '@/components/icons';

export type CardState = 'idle' | 'correct' | 'wrong';

export type CardSize = 'word' | 'sentence';

const LABEL_SIZES: Record<CardSize, string> = {
  word: 'h-32 text-xl tracking-wide uppercase',
  sentence: 'min-h-20 px-4 py-3 text-center text-lg leading-snug sm:text-xl',
};

const IDLE_TILES = ['bg-tile', 'bg-card-2', 'bg-card-3', 'bg-card-4'] as const;

export const WordCard = ({
  word,
  state,
  tint,
  locked,
  disabled,
  onSelect,
  size = 'word',
  dimmed = false,
}: {
  readonly word: string;
  readonly state: CardState;
  readonly tint: number;
  readonly locked: boolean;
  readonly disabled: boolean;
  readonly onSelect: () => void;
  readonly size?: CardSize;
  readonly dimmed?: boolean;
}) => {
  const card =
    state === 'correct'
      ? 'border-correct-edge bg-correct'
      : state === 'wrong'
        ? 'border-wrong-edge bg-wrong'
        : 'border-transparent bg-surface';
  const tile =
    state === 'correct'
      ? 'bg-correct'
      : state === 'wrong'
        ? 'bg-wrong'
        : IDLE_TILES[tint % IDLE_TILES.length];
  const ink =
    state === 'correct' ? 'text-correct-ink' : state === 'wrong' ? 'text-wrong-ink' : 'text-ink';
  // The correct card is lifted, not just recoloured — it reads as the answer even
  // beside a green-ish idle tile.
  const pop = state === 'correct' ? 'z-10 scale-[1.03] shadow-xl ring-4 ring-correct-edge/30' : '';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`relative w-full rounded-3xl border-2 p-3 text-left shadow-md transition duration-200 enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:shadow-xl ${
        locked ? 'cursor-not-allowed opacity-55' : ''
      } ${dimmed && state === 'idle' ? 'opacity-40' : ''} ${card} ${pop}`}
    >
      {state === 'correct' && (
        <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-correct-edge text-white">
          <CheckIcon className="h-4 w-4" />
        </span>
      )}
      <span
        className={`flex items-center justify-center rounded-2xl ${LABEL_SIZES[size]} ${
          state === 'correct' ? 'font-black' : 'font-extrabold'
        } ${tile} ${ink}`}
      >
        {word}
      </span>
    </button>
  );
};
