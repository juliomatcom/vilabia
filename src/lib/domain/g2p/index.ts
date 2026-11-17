import { toGraphemes } from './graphemes';
import { toWords } from './normalize';
import { toSegments } from './phonemes';
import { applyStress } from './stress';
import { toProtoSyllables } from './syllables';
import { DISTINCION, type Dialect, type Word } from './types';

export { SESEO, DISTINCION, PHONEMES } from './types';
export type { Dialect, Phoneme, Syllable, Word } from './types';

export const toPhonemes = (text: string, dialect: Dialect = DISTINCION): readonly Word[] =>
  toWords(text).map((word) => ({
    text: word,
    syllables: applyStress(toProtoSyllables(toSegments(toGraphemes(word), dialect)), word),
  }));

export const toIpa = (words: readonly Word[]): string =>
  words
    .map((word) =>
      word.syllables
        .map((syllable) => `${syllable.stressed ? 'ˈ' : ''}${syllable.phonemes.join('')}`)
        .join('.'),
    )
    .join(' ');
