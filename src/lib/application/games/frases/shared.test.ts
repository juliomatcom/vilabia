import { DIFFICULTY_RANGE, levelExaggeration } from '@/lib/application/games/adivina/level';
import { phraseExaggeration, progressOf, shuffle, voiceAllowed } from './shared';

describe('sentence game shared rules', () => {
  it('shuffles without losing or mutating items', () => {
    const items = ['a', 'b', 'c', 'd'] as const;
    const out = shuffle(items, Math.random);
    expect([...out].sort()).toEqual([...items]);
    expect(items).toEqual(['a', 'b', 'c', 'd']);
  });

  it('lays list progress onto the word game’s exaggeration curve', () => {
    expect(phraseExaggeration(0, 0)).toBe(levelExaggeration(1));
    expect(phraseExaggeration(1, 0)).toBe(levelExaggeration(25));
    expect(phraseExaggeration(0.5, 0)).toBeGreaterThan(phraseExaggeration(0.5, 5));
  });

  it('measures progress from 0 at the first entry to 1 at the last', () => {
    expect(progressOf(0, 40)).toBe(0);
    expect(progressOf(39, 40)).toBe(1);
    expect(progressOf(0, 1)).toBe(0);
  });

  it('silences the voice only at Difícil', () => {
    expect(voiceAllowed(DIFFICULTY_RANGE.easiest)).toBe(true);
    expect(voiceAllowed(0)).toBe(true);
    expect(voiceAllowed(DIFFICULTY_RANGE.hardest)).toBe(false);
  });
});
