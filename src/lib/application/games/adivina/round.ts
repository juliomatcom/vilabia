import { BANK, type BankWord } from '@/lib/domain/words';
import { visemeDistance } from '@/lib/domain/viseme';
import { clampLevel, levelConfusion, MAX_LEVEL } from './level';

export type Round = {
  readonly target: string;
  readonly options: readonly string[];
};

export type DrawOptions = {
  readonly level: number;
  readonly difficultyOffset?: number;
  readonly rng?: () => number;
  readonly avoidTarget?: string;
};

type Candidate = BankWord & {
  readonly distance: number;
};

const DISTRACTORS = 3;
const LENGTH_TOLERANCE = 1;
const BAND_TOLERANCE = 1;
const CHOICE_POOL = 16;
const TARGET_ATTEMPTS = 24;

const shuffle = <T>(items: readonly T[], rng: () => number): readonly T[] =>
  items
    .map((item) => ({ item, key: rng() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);

const rank = (
  bank: readonly BankWord[],
  target: BankWord,
  wanted: number,
  homophenesAllowed: boolean,
): readonly Candidate[] => {
  const others = bank.filter((entry) => entry.word !== target.word);
  const sized = others.filter(
    (entry) => Math.abs(entry.sequence.length - target.sequence.length) <= LENGTH_TOLERANCE,
  );
  const scored = (sized.length >= CHOICE_POOL ? sized : others).map((entry) => ({
    ...entry,
    distance: visemeDistance(target.sequence, entry.sequence),
  }));
  const eligible = homophenesAllowed ? scored : scored.filter((entry) => entry.distance >= 1);
  const pool = eligible.length >= DISTRACTORS ? eligible : scored;
  return [...pool].sort((a, b) => Math.abs(a.distance - wanted) - Math.abs(b.distance - wanted));
};

const pairs = (chosen: readonly BankWord[], candidate: BankWord, wanted: number): boolean =>
  chosen.every(
    (entry) =>
      Math.abs(entry.sequence.length - candidate.sequence.length) <= LENGTH_TOLERANCE &&
      Math.abs(visemeDistance(entry.sequence, candidate.sequence) - wanted) <= BAND_TOLERANCE,
  );

const extend = (
  chosen: readonly BankWord[],
  ranked: readonly Candidate[],
  wanted: number,
  rng: () => number,
): readonly BankWord[] | undefined => {
  if (chosen.length > DISTRACTORS) return chosen;
  const viable = ranked.filter((candidate) => pairs(chosen, candidate, wanted));
  if (viable.length === 0) return undefined;
  const pick = viable[Math.floor(rng() * Math.min(viable.length, CHOICE_POOL))];
  return extend(
    [...chosen, pick],
    ranked.filter((candidate) => candidate.word !== pick.word),
    wanted,
    rng,
  );
};

const attemptQuad = (
  bank: readonly BankWord[],
  pool: readonly BankWord[],
  confusion: number,
  homophenesAllowed: boolean,
  rng: () => number,
  attemptsLeft: number,
): readonly BankWord[] => {
  const target = pool[Math.floor(rng() * pool.length)];
  const wanted = confusion * target.sequence.length;
  const ranked = rank(bank, target, wanted, homophenesAllowed);
  const banded = ranked.filter((entry) => Math.abs(entry.distance - wanted) <= BAND_TOLERANCE);
  const quad = extend([target], banded, wanted, rng);
  if (quad !== undefined) return quad;
  if (attemptsLeft <= 1) return [target, ...ranked.slice(0, DISTRACTORS)];
  return attemptQuad(bank, pool, confusion, homophenesAllowed, rng, attemptsLeft - 1);
};

export const drawRound = (
  bank: readonly BankWord[] = BANK,
  { level, difficultyOffset = 0, rng = Math.random, avoidTarget }: DrawOptions,
): Round => {
  const effectiveLevel = clampLevel(level + difficultyOffset);
  const pool =
    avoidTarget === undefined || bank.length <= 1
      ? bank
      : bank.filter((entry) => entry.word !== avoidTarget);

  const [target, ...distractors] = attemptQuad(
    bank,
    pool,
    levelConfusion(effectiveLevel),
    effectiveLevel === MAX_LEVEL,
    rng,
    TARGET_ATTEMPTS,
  );

  return {
    target: target.word,
    options: shuffle([target, ...distractors], rng).map((entry) => entry.word),
  };
};
