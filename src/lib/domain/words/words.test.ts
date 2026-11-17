import { DISTINCION, toIpa, toPhonemes } from '@/lib/domain/g2p';
import { WORDS, sequenceOf } from './index';

describe('word bank', () => {
  it('is large enough that a level rarely repeats a set', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(1000);
  });

  it('holds no duplicates', () => {
    expect(new Set(WORDS).size).toBe(WORDS.length);
  });

  it('spells every word with graphemes the g2p accepts', () => {
    expect(WORDS.filter((word) => !/^[a-záéíóúüñ]+$/u.test(word))).toEqual([]);
  });

  it('maps every word to a non-empty viseme sequence', () => {
    expect(WORDS.filter((word) => sequenceOf(word).length === 0)).toEqual([]);
  });
});

describe('word bank sound', () => {
  const soundOf = (word: string): string => toIpa(toPhonemes(word, DISTINCION));

  it('holds no two words that sound the same', () => {
    const bySound = WORDS.reduce<Record<string, readonly string[]>>(
      (groups, word) => ({ ...groups, [soundOf(word)]: [...(groups[soundOf(word)] ?? []), word] }),
      {},
    );
    expect(Object.values(bySound).filter((group) => group.length > 1)).toEqual([]);
  });

  it('keeps out words whose Spanish spelling rules misplace the sounds', () => {
    expect(WORDS.filter((word) => /sh|ck|ff|rb$|rt$|nt$|rf$|^sn/u.test(word))).toEqual([]);
  });
});
