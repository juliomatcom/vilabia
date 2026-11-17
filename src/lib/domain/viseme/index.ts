import type { Phoneme, Word } from '@/lib/domain/g2p';
import { VISEME_OF, type Viseme } from './inventory';

export { VISEMES, VISEME_OF } from './inventory';
export type { Viseme } from './inventory';
export { visemeDistance } from './distance';
export { ALPHABET } from './alphabet';
export type { Letter } from './alphabet';

export type VisemeSegment = {
  readonly phoneme: Phoneme;
  readonly viseme: Viseme;
  readonly stressed: boolean;
  readonly startsWord: boolean;
};

export const visemeOf = (phoneme: Phoneme): Viseme => VISEME_OF[phoneme];

export const toVisemes = (words: readonly Word[]): readonly VisemeSegment[] =>
  words.flatMap((word) =>
    word.syllables
      .flatMap((syllable) =>
        syllable.phonemes.map((phoneme) => ({
          phoneme,
          viseme: visemeOf(phoneme),
          stressed: syllable.stressed,
        })),
      )
      .map((segment, index) => ({ ...segment, startsWord: index === 0 })),
  );

export const toVisemeCodes = (words: readonly Word[]): readonly Viseme[] =>
  toVisemes(words).map((segment) => segment.viseme);
