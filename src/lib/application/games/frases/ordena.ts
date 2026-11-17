import { ORDER_SENTENCES, SYLLABLE_GROUPS } from '@/lib/domain/phrases';
import { shuffle, type Rng } from './shared';

const SHUFFLE_ATTEMPTS = 12;
// Two words have one wrong order only: a swap, not a puzzle.
const MIN_WORDS = 3;

// `id`, not `text`, identifies a chip: a sentence can repeat a word (`de … de`).
export type Token = {
  readonly id: number;
  readonly text: string;
};

export type OrdenaPhase = 'arranging' | 'checked' | 'correct';

export type OrdenaState = {
  readonly level: number;
  readonly difficultyOffset: number;
  readonly sentence: string;
  readonly answer: readonly Token[];
  readonly shuffled: readonly Token[];
  readonly slots: readonly (number | undefined)[];
  readonly locked: readonly number[];
  readonly phase: OrdenaPhase;
  readonly score?: number;
  readonly finished: boolean;
};

// Lowercased: a capital would single a chip out (the first word, a name).
export const tokenize = (sentence: string): readonly Token[] =>
  sentence
    .split(/\s+/u)
    .map((word) => word.replace(/[.,;:¿?¡!«»"]/gu, ''))
    .filter((word) => word.length > 0)
    .map((word, id) => ({ id, text: word.toLocaleLowerCase('es') }));

export const wordCount = (sentence: string): number => tokenize(sentence).length;

// Reorders and filters authored sentences only; never writes one.
export const byLength = (sentences: readonly string[]): readonly string[] =>
  sentences
    .filter((sentence, index) => sentences.indexOf(sentence) === index)
    .map((sentence, index) => ({ sentence, index, words: wordCount(sentence) }))
    .filter(({ words }) => words >= MIN_WORDS)
    .sort((a, b) => a.words - b.words || a.index - b.index)
    .map(({ sentence }) => sentence);

export const ORDENA_SENTENCES: readonly string[] = byLength([
  ...SYLLABLE_GROUPS.flatMap((group) => group.sentences),
  ...ORDER_SENTENCES,
]);

export type WordRound = {
  readonly sentence: string;
  readonly extras: readonly string[];
  readonly extraCount: number;
};

export const plainRounds = (sentences: readonly string[]): readonly WordRound[] =>
  sentences.map((sentence) => ({ sentence, extras: [], extraCount: 0 }));

export const ORDENA_ROUNDS: readonly WordRound[] = plainRounds(ORDENA_SENTENCES);

export const ORDENA_LEVELS = ORDENA_ROUNDS.length;

export type LengthStep = { readonly words: number; readonly level: number };

export const lengthSteps = (
  sentences: readonly string[] = ORDENA_SENTENCES,
): readonly LengthStep[] =>
  sentences.flatMap((sentence, index) =>
    index > 0 && wordCount(sentences[index - 1] as string) === wordCount(sentence)
      ? []
      : [{ words: wordCount(sentence), level: index + 1 }],
  );

const sameOrder = (a: readonly Token[], b: readonly Token[]): boolean =>
  a.length === b.length && a.every((token, index) => token.text === b[index]?.text);

// Fallback when every random shuffle happened to read in order.
const forceDifferent = (tokens: readonly Token[]): readonly Token[] => {
  const other = tokens.findIndex((token) => token.text !== tokens[0]?.text);
  if (other < 0) return tokens;
  return tokens.map((token, index) =>
    index === 0 ? (tokens[other] as Token) : index === other ? (tokens[0] as Token) : token,
  );
};

export const shuffleTokens = (tokens: readonly Token[], rng: Rng): readonly Token[] => {
  const attempts = Array.from({ length: SHUFFLE_ATTEMPTS }, () => shuffle(tokens, rng));
  return attempts.find((order) => !sameOrder(order, tokens)) ?? forceDifferent(tokens);
};

const roundAtLevel = (level: number, rounds: readonly WordRound[]): WordRound =>
  rounds[Math.min(rounds.length, Math.max(1, level)) - 1] as WordRound;

// Extras are slotted between the shuffled words without reordering them, so the
// sentence's own words still never read in order.
export const dealPile = (
  answer: readonly Token[],
  extras: readonly string[],
  rng: Rng,
): readonly Token[] => {
  const words = shuffleTokens(answer, rng).map((token, index) => ({ token, key: index }));
  const extraTokens = extras.map((text, index) => ({
    token: { id: answer.length + index, text },
    key: rng() * answer.length,
  }));
  return [...words, ...extraTokens].sort((a, b) => a.key - b.key).map(({ token }) => token);
};

const roundAt = (
  level: number,
  difficultyOffset: number,
  rng: Rng,
  rounds: readonly WordRound[],
): OrdenaState => {
  const round = roundAtLevel(level, rounds);
  const answer = tokenize(round.sentence);
  return {
    level,
    difficultyOffset,
    sentence: round.sentence,
    answer,
    shuffled: dealPile(answer, shuffle(round.extras, rng).slice(0, round.extraCount), rng),
    slots: answer.map(() => undefined),
    locked: [],
    phase: 'arranging',
    finished: false,
  };
};

export const createOrdena = (
  rng: Rng = Math.random,
  { level = 1, difficultyOffset = 0, rounds = ORDENA_ROUNDS } = {},
): OrdenaState => roundAt(level, difficultyOffset, rng, rounds);

export const isPlaced = (state: OrdenaState, id: number): boolean => state.slots.includes(id);

export const tokenById = (state: OrdenaState, id: number): Token | undefined =>
  state.shuffled.find((token) => token.id === id);

export const place = (state: OrdenaState, id: number): OrdenaState => {
  const empty = state.slots.indexOf(undefined);
  if (state.phase === 'correct' || empty < 0 || isPlaced(state, id)) return state;
  return {
    ...state,
    phase: 'arranging',
    slots: state.slots.map((slot, index) => (index === empty ? id : slot)),
  };
};

export const unplace = (state: OrdenaState, slot: number): OrdenaState => {
  if (state.phase === 'correct' || state.locked.includes(slot)) return state;
  return {
    ...state,
    phase: 'arranging',
    slots: state.slots.map((id, index) => (index === slot ? undefined : id)),
  };
};

export const clearSlots = (state: OrdenaState): OrdenaState =>
  state.phase === 'correct'
    ? state
    : {
        ...state,
        phase: 'arranging',
        slots: state.slots.map((id, index) => (state.locked.includes(index) ? id : undefined)),
      };

export const isFull = (state: OrdenaState): boolean => !state.slots.includes(undefined);

// By text, not id: a repeated word is right in either of its places.
export const slotMarks = (state: OrdenaState): readonly boolean[] =>
  state.slots.map(
    (id, index) => id !== undefined && tokenById(state, id)?.text === state.answer[index]?.text,
  );

export const check = (
  state: OrdenaState,
  rounds: readonly WordRound[] = ORDENA_ROUNDS,
): OrdenaState => {
  if (state.phase === 'correct' || !isFull(state)) return state;
  const marks = slotMarks(state);
  const score = marks.filter(Boolean).length;
  if (score === state.answer.length) {
    const last = state.level >= rounds.length;
    return {
      ...state,
      score,
      phase: 'correct',
      locked: marks.map((_, index) => index),
      finished: last,
    };
  }
  return {
    ...state,
    score,
    phase: 'checked',
    locked: marks.flatMap((right, index) => (right ? [index] : [])),
    slots: state.slots.map((id, index) => (marks[index] ? id : undefined)),
  };
};

export const placeAndCheck = (
  state: OrdenaState,
  id: number,
  rounds: readonly WordRound[] = ORDENA_ROUNDS,
): OrdenaState => {
  const placed = place(state, id);
  return placed !== state && isFull(placed) ? check(placed, rounds) : placed;
};

export const nextOrdena = (
  state: OrdenaState,
  rng: Rng = Math.random,
  rounds: readonly WordRound[] = ORDENA_ROUNDS,
): OrdenaState =>
  state.finished || state.phase !== 'correct'
    ? state
    : roundAt(state.level + 1, state.difficultyOffset, rng, rounds);

export const startAt = (
  state: OrdenaState,
  level: number,
  rng: Rng = Math.random,
  rounds: readonly WordRound[] = ORDENA_ROUNDS,
): OrdenaState => createOrdena(rng, { level, difficultyOffset: state.difficultyOffset, rounds });
