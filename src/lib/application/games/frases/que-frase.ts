import { FIND_SENTENCES, type FindSentence } from '@/lib/domain/phrases';
import { choiceRound, type ChoicePhase, type ChoiceRound, type Rng } from './shared';

export type QueFraseState = {
  readonly level: number;
  readonly difficultyOffset: number;
  readonly round: ChoiceRound;
  readonly phase: ChoicePhase;
  readonly pick?: string;
  readonly finished: boolean;
};

export const QUE_FRASE_LEVELS = FIND_SENTENCES.length;

const entryAt = (level: number, entries: readonly FindSentence[]): FindSentence =>
  entries[Math.min(entries.length, Math.max(1, level)) - 1] as FindSentence;

const roundAt = (level: number, rng: Rng, entries: readonly FindSentence[]): ChoiceRound => {
  const entry = entryAt(level, entries);
  return choiceRound(entry.target, entry.cards, rng);
};

export const createQueFrase = (
  rng: Rng = Math.random,
  { level = 1, difficultyOffset = 0, entries = FIND_SENTENCES } = {},
): QueFraseState => ({
  level,
  difficultyOffset,
  phase: 'playing',
  round: roundAt(level, rng, entries),
  finished: false,
});

export const answerQueFrase = (
  state: QueFraseState,
  pick: string,
  entries: readonly FindSentence[] = FIND_SENTENCES,
): QueFraseState => {
  if (state.phase !== 'playing') return state;
  const correct = pick === state.round.target;
  const last = state.level >= entries.length;
  return {
    ...state,
    pick,
    phase: correct ? 'correct' : 'wrong',
    level: correct && !last ? state.level + 1 : state.level,
    finished: correct && last,
  };
};

export const nextQueFrase = (
  state: QueFraseState,
  rng: Rng = Math.random,
  entries: readonly FindSentence[] = FIND_SENTENCES,
): QueFraseState =>
  state.finished
    ? state
    : { ...state, pick: undefined, phase: 'playing', round: roundAt(state.level, rng, entries) };
