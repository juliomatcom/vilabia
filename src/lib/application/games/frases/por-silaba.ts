import { SYLLABLE_GROUPS, type SyllableGroup } from '@/lib/domain/phrases';
import { choiceRound, shuffle, type ChoicePhase, type ChoiceRound, type Rng } from './shared';

const CARDS = 4;

export type PorSilabaState = {
  readonly group: number;
  readonly difficultyOffset: number;
  // Still to be recognised; the head is the current target.
  readonly pending: readonly string[];
  readonly round: ChoiceRound;
  readonly phase: ChoicePhase;
  readonly pick?: string;
  readonly finished: boolean;
};

const groupAt = (index: number, groups: readonly SyllableGroup[]): SyllableGroup =>
  groups[Math.min(groups.length - 1, Math.max(0, index))] as SyllableGroup;

export const drawCards = (
  target: string,
  sentences: readonly string[],
  rng: Rng,
): readonly string[] => [
  target,
  ...shuffle(
    sentences.filter((sentence) => sentence !== target),
    rng,
  ).slice(0, CARDS - 1),
];

const roundFor = (target: string, group: SyllableGroup, rng: Rng): ChoiceRound =>
  choiceRound(target, drawCards(target, group.sentences, rng), rng);

const startGroup = (
  index: number,
  difficultyOffset: number,
  rng: Rng,
  groups: readonly SyllableGroup[],
): PorSilabaState => {
  const group = groupAt(index, groups);
  const pending = shuffle(group.sentences, rng);
  return {
    group: groups.indexOf(group),
    difficultyOffset,
    pending,
    round: roundFor(pending[0] as string, group, rng),
    phase: 'playing',
    finished: false,
  };
};

export const createPorSilaba = (
  rng: Rng = Math.random,
  { group = 0, difficultyOffset = 0, groups = SYLLABLE_GROUPS } = {},
): PorSilabaState => startGroup(group, difficultyOffset, rng, groups);

export const selectGroup = (
  state: PorSilabaState,
  group: number,
  rng: Rng = Math.random,
  groups: readonly SyllableGroup[] = SYLLABLE_GROUPS,
): PorSilabaState => startGroup(group, state.difficultyOffset, rng, groups);

export const answerPorSilaba = (state: PorSilabaState, pick: string): PorSilabaState => {
  if (state.phase !== 'playing') return state;
  const [target, ...rest] = state.pending;
  const correct = pick === state.round.target;
  return {
    ...state,
    pick,
    phase: correct ? 'correct' : 'wrong',
    pending: correct ? rest : [...rest, target as string],
  };
};

export const nextPorSilaba = (
  state: PorSilabaState,
  rng: Rng = Math.random,
  groups: readonly SyllableGroup[] = SYLLABLE_GROUPS,
): PorSilabaState => {
  if (state.finished) return state;
  if (state.pending.length > 0)
    return {
      ...state,
      pick: undefined,
      phase: 'playing',
      round: roundFor(state.pending[0] as string, groupAt(state.group, groups), rng),
    };
  if (state.group >= groups.length - 1) return { ...state, finished: true };
  return startGroup(state.group + 1, state.difficultyOffset, rng, groups);
};

export const groupLabel = (group: SyllableGroup): string => group.syllables.join(' · ');

// Two groups start with `ja`: each label is the first syllable no earlier group shows.
export const groupShortLabels = (groups: readonly SyllableGroup[]): readonly string[] =>
  groups.reduce<readonly string[]>(
    (labels, group) => [
      ...labels,
      group.syllables.find((syllable) => !labels.includes(syllable)) ?? groupLabel(group),
    ],
    [],
  );
