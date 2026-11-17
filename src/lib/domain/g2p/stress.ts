import type { ProtoSyllable } from './syllables';
import type { Syllable } from './types';

const PENULTIMATE_ENDINGS: readonly string[] = ['a', 'e', 'i', 'o', 'u', 'n', 's'];

const stressedIndex = (protoSyllables: readonly ProtoSyllable[], word: string): number => {
  const accented = protoSyllables.findIndex((syllable) => syllable.accented);
  return accented >= 0
    ? accented
    : protoSyllables.length < 2
      ? 0
      : PENULTIMATE_ENDINGS.includes(word.slice(-1))
        ? protoSyllables.length - 2
        : protoSyllables.length - 1;
};

export const applyStress = (
  protoSyllables: readonly ProtoSyllable[],
  word: string,
): readonly Syllable[] =>
  protoSyllables.map((syllable, index) => ({
    phonemes: syllable.phonemes,
    stressed: index === stressedIndex(protoSyllables, word),
  }));
