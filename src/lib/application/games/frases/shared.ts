import {
  DIFFICULTY_RANGE,
  levelExaggeration,
  MAX_LEVEL,
  MIN_LEVEL,
} from '@/lib/application/games/adivina/level';

export type Rng = () => number;

export const shuffle = <T>(items: readonly T[], rng: Rng): readonly T[] =>
  items
    .map((item) => ({ item, key: rng() }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);

// The sentence games walk an authored list, not a 25-level curve: their progress (0 to 1)
// is laid onto the word game's levels so exaggeration falls the same way.
export const phraseExaggeration = (progress: number, difficultyOffset: number): number =>
  levelExaggeration(MIN_LEVEL + progress * (MAX_LEVEL - MIN_LEVEL) + difficultyOffset);

export const progressOf = (index: number, count: number): number =>
  count <= 1 ? 0 : Math.min(1, Math.max(0, index / (count - 1)));

export const voiceAllowed = (difficultyOffset: number): boolean =>
  difficultyOffset < DIFFICULTY_RANGE.hardest;

export type ChoicePhase = 'playing' | 'correct' | 'wrong';

export type ChoiceRound = {
  readonly target: string;
  readonly options: readonly string[];
};

export const choiceRound = (target: string, cards: readonly string[], rng: Rng): ChoiceRound => ({
  target,
  options: shuffle(cards, rng),
});
