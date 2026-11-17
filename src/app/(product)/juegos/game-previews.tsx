import type { ReactNode } from 'react';
import { Face } from '@/components/face';
import { CheckIcon } from '@/components/icons';
import { SHAPES, SMILE_SHAPE, type MouthShape } from '@/lib/domain/mouth';

type Preview = {
  readonly tile: string;
  readonly shape: MouthShape;
  readonly scene: ReactNode;
};

const Tick = () => (
  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-correct-edge text-white">
    <CheckIcon className="h-2.5 w-2.5" />
  </span>
);

const Chip = ({
  children,
  className = 'bg-surface text-ink',
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) => (
  <span
    className={`relative inline-flex items-center justify-center rounded-lg px-2 py-1 text-xs font-bold shadow-sm ${className}`}
  >
    {children}
  </span>
);

const WordGrid = () => (
  <div className="grid grid-cols-2 gap-1.5">
    {['PALA', 'BALA', 'MALA', 'TALA'].map((word) => (
      <Chip
        key={word}
        className={
          word === 'PALA'
            ? 'border-2 border-correct-edge bg-correct text-correct-ink'
            : 'bg-surface text-ink'
        }
      >
        {word}
        {word === 'PALA' && <Tick />}
      </Chip>
    ))}
  </div>
);

const SyllableBubbles = () => (
  <div className="flex flex-col items-start gap-1.5">
    {['ba', 'be', 'bo'].map((syllable, index) => (
      <span
        key={syllable}
        style={{ marginLeft: `${index * 0.75}rem` }}
        className="rounded-full rounded-bl-sm bg-brand px-3 py-1 text-sm font-black text-white shadow-sm"
      >
        {syllable}
      </span>
    ))}
    <Chip>El bebé bebe.</Chip>
  </div>
);

const SentenceChoices = () => (
  <div className="flex w-32 flex-col gap-1.5">
    {['Mi gato come…', 'Mi pato come…', 'Mi gata come…'].map((sentence, index) => (
      <Chip
        key={sentence}
        className={
          index === 0
            ? 'justify-start border-2 border-correct-edge bg-correct text-correct-ink'
            : 'justify-start bg-surface text-ink opacity-70'
        }
      >
        {sentence}
        {index === 0 && <Tick />}
      </Chip>
    ))}
  </div>
);

const WordOrder = () => (
  <div className="flex flex-col items-center gap-2">
    <div className="flex gap-1">
      {['isla', 'En', 'la'].map((word) => (
        <Chip key={word} className="bg-card-2 text-ink">
          {word}
        </Chip>
      ))}
    </div>
    <span aria-hidden="true" className="text-lg leading-none font-black text-brand-deep">
      ↓
    </span>
    <div className="flex gap-1 rounded-xl bg-surface p-1.5 shadow-sm">
      {['En', 'la', 'isla'].map((word, index) => (
        <span
          key={word}
          className="flex flex-col items-center rounded-lg border-2 border-correct-edge bg-correct px-1.5 py-0.5 text-xs font-bold text-correct-ink"
        >
          <span className="text-[0.6rem] leading-none opacity-70">{index + 1}</span>
          {word}
        </span>
      ))}
    </div>
  </div>
);

const WordBag = () => (
  <div className="flex flex-col items-center gap-2">
    <div className="flex max-w-36 flex-wrap justify-center gap-1">
      {['pato', 'gato', 'mi', 'gata', 'come'].map((word) => (
        <Chip
          key={word}
          className={
            word === 'pato' || word === 'gata'
              ? 'bg-wrong text-wrong-ink line-through decoration-2'
              : 'bg-card-4 text-ink'
          }
        >
          {word}
        </Chip>
      ))}
    </div>
    <span aria-hidden="true" className="text-lg leading-none font-black text-brand-deep">
      ↓
    </span>
    <div className="flex gap-1 rounded-xl bg-surface p-1.5 shadow-sm">
      {['mi', 'gato', 'come'].map((word) => (
        <span
          key={word}
          className="rounded-lg border-2 border-correct-edge bg-correct px-1.5 py-0.5 text-xs font-bold text-correct-ink"
        >
          {word}
        </span>
      ))}
    </div>
  </div>
);

const PREVIEWS: Readonly<Record<string, Preview>> = {
  'adivina-la-palabra': { tile: 'bg-tile', shape: SHAPES.a, scene: <WordGrid /> },
  'frases-por-silaba': { tile: 'bg-card-3', shape: SHAPES.o, scene: <SyllableBubbles /> },
  'que-frase-dijo': { tile: 'bg-card-2', shape: SHAPES.e, scene: <SentenceChoices /> },
  'ordena-la-frase': { tile: 'bg-card-4', shape: SHAPES.u, scene: <WordOrder /> },
  'construye-la-frase': { tile: 'bg-hero', shape: SHAPES.i, scene: <WordBag /> },
};

export const hasPreview = (slug: string): boolean => slug in PREVIEWS;

export const GamePreview = ({ slug }: { readonly slug: string }) => {
  const preview = PREVIEWS[slug];
  if (preview === undefined)
    return (
      <div className="flex items-center justify-center rounded-2xl bg-tile p-4">
        <Face shape={SMILE_SHAPE} className="h-40 w-auto" />
      </div>
    );
  return (
    <div
      aria-hidden="true"
      className={`flex h-48 items-center justify-center gap-2 overflow-hidden rounded-2xl px-3 pt-4 ${preview.tile}`}
    >
      <Face shape={preview.shape} className="h-44 w-auto shrink-0 self-end" />
      <div className="shrink-0 pb-4">{preview.scene}</div>
    </div>
  );
};
