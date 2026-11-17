import { BANK } from '@/lib/domain/words';
import { clampLevel } from './level';
import { drawRound, type Round } from './round';

export type Phase = 'playing' | 'correct' | 'wrong';

export type GameState = {
  readonly level: number;
  readonly difficultyOffset: number;
  readonly round: Round;
  readonly phase: Phase;
  readonly pick?: string;
};

export const createGame = (rng: () => number = Math.random): GameState => {
  const level = 1;
  const difficultyOffset = 0;
  return {
    level,
    difficultyOffset,
    phase: 'playing',
    round: drawRound(BANK, { level, difficultyOffset, rng }),
  };
};

export const answer = (state: GameState, pick: string): GameState => {
  if (state.phase !== 'playing') return state;
  const correct = pick === state.round.target;
  return {
    ...state,
    pick,
    phase: correct ? 'correct' : 'wrong',
    level: correct ? clampLevel(state.level + 1) : state.level,
  };
};

export const redraw = (state: GameState, rng: () => number = Math.random): GameState => ({
  ...state,
  pick: undefined,
  phase: 'playing',
  round: drawRound(BANK, {
    level: state.level,
    difficultyOffset: state.difficultyOffset,
    rng,
    avoidTarget: state.round.target,
  }),
});

export const setDifficultyOffset = (state: GameState, difficultyOffset: number): GameState => ({
  ...state,
  difficultyOffset,
});
