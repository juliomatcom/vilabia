import { SYLLABLE_GROUPS } from '@/lib/domain/phrases';
import {
  answerPorSilaba,
  createPorSilaba,
  drawCards,
  groupLabel,
  groupShortLabels,
  nextPorSilaba,
  selectGroup,
  type PorSilabaState,
} from './por-silaba';

const solveGroup = (state: PorSilabaState): PorSilabaState =>
  state.pending.reduce((game) => nextPorSilaba(answerPorSilaba(game, game.round.target)), state);

describe('Frases por sílaba', () => {
  it('starts on the first group with a target from that group', () => {
    const game = createPorSilaba();
    expect(game.group).toBe(0);
    expect(SYLLABLE_GROUPS[0]?.sentences).toContain(game.round.target);
  });

  it('offers four cards from the group, the target among them', () => {
    const sentences = SYLLABLE_GROUPS[0]?.sentences ?? [];
    const cards = drawCards(sentences[2] as string, sentences, Math.random);
    expect(cards).toHaveLength(4);
    expect(cards).toContain(sentences[2]);
    expect(cards.every((card) => sentences.includes(card))).toBe(true);
    expect(new Set(cards).size).toBe(4);
  });

  it('uses what a smaller group has', () => {
    expect(drawCards('a', ['a', 'b', 'c'], Math.random)).toHaveLength(3);
  });

  it('moves a missed sentence to the back of the group', () => {
    const game = createPorSilaba();
    const miss = game.round.options.find((option) => option !== game.round.target) as string;
    const after = answerPorSilaba(game, miss);
    expect(after.phase).toBe('wrong');
    expect(after.pending).toHaveLength(game.pending.length);
    expect(after.pending.at(-1)).toBe(game.round.target);
  });

  it('moves to the next group once every sentence is recognised', () => {
    const game = solveGroup(createPorSilaba());
    expect(game.group).toBe(1);
    expect(game.phase).toBe('playing');
    expect(SYLLABLE_GROUPS[1]?.sentences).toContain(game.round.target);
  });

  it('opens any group directly', () => {
    const game = selectGroup(createPorSilaba(), 5);
    expect(game.group).toBe(5);
    expect(SYLLABLE_GROUPS[5]?.sentences).toContain(game.round.target);
  });

  it('finishes after the last group', () => {
    const last = selectGroup(createPorSilaba(), SYLLABLE_GROUPS.length - 1);
    const done = solveGroup(last);
    expect(done.finished).toBe(true);
    expect(nextPorSilaba(done)).toBe(done);
  });

  it('labels a group by its syllables', () => {
    expect(groupLabel(SYLLABLE_GROUPS[0] as (typeof SYLLABLE_GROUPS)[number])).toBe(
      'ba · bo · be · bu · bi',
    );
  });

  it('gives every group a distinct short label', () => {
    const labels = groupShortLabels(SYLLABLE_GROUPS);
    expect(new Set(labels).size).toBe(SYLLABLE_GROUPS.length);
    expect(labels.slice(0, 3)).toEqual(['ba', 'va', 'ja']);
    expect(labels[15]).toBe('gi');
  });
});
