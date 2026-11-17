import type { Dialect, Phoneme, Segment } from './types';

const VOWELS: Readonly<Record<string, Phoneme>> = {
  a: 'a',
  e: 'e',
  i: 'i',
  o: 'o',
  u: 'u',
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ü: 'u',
};

const CONTEXT_FREE_CONSONANTS: Readonly<Record<string, Phoneme>> = {
  b: 'b',
  v: 'b',
  d: 'd',
  f: 'f',
  k: 'k',
  l: 'l',
  m: 'm',
  n: 'n',
  p: 'p',
  s: 's',
  t: 't',
  w: 'w',
  ñ: 'ɲ',
  j: 'x',
  q: 'k',
};

const ACCENTED_VOWELS: readonly string[] = ['á', 'é', 'í', 'ó', 'ú'];
const FRONT_VOWELS: readonly string[] = ['e', 'i', 'é', 'í'];
const TRILL_TRIGGERS: readonly string[] = ['n', 'l', 's'];

const isVowelGrapheme = (grapheme: string): boolean => grapheme in VOWELS;

const phonemesFor = (
  grapheme: string,
  index: number,
  graphemes: readonly string[],
  dialect: Dialect,
): readonly Phoneme[] => {
  const next = graphemes[index + 1] ?? '';
  const previous = graphemes[index - 1] ?? '';
  switch (grapheme) {
    case 'h':
      return [];
    case 'ch':
      return ['tʃ'];
    case 'll':
      return [dialect.yeismo ? 'ʝ' : 'ʎ'];
    case 'rr':
      return ['r'];
    case 'qu':
      return ['k'];
    case 'gu':
      return ['ɡ'];
    case 'gü':
      return ['ɡ', 'u'];
    case 'c':
      return FRONT_VOWELS.includes(next) ? [dialect.seseo ? 's' : 'θ'] : ['k'];
    case 'z':
      return [dialect.seseo ? 's' : 'θ'];
    case 'g':
      return FRONT_VOWELS.includes(next) ? ['x'] : ['ɡ'];
    case 'x':
      return index === 0 ? ['s'] : ['k', 's'];
    case 'r':
      return index === 0 || TRILL_TRIGGERS.includes(previous) ? ['r'] : ['ɾ'];
    case 'y':
      return isVowelGrapheme(next) ? ['ʝ'] : ['i'];
    default:
      return isVowelGrapheme(grapheme)
        ? [VOWELS[grapheme]]
        : grapheme in CONTEXT_FREE_CONSONANTS
          ? [CONTEXT_FREE_CONSONANTS[grapheme]]
          : [];
  }
};

export const toSegments = (graphemes: readonly string[], dialect: Dialect): readonly Segment[] =>
  graphemes.flatMap((grapheme, index) =>
    phonemesFor(grapheme, index, graphemes, dialect).map((phoneme) => ({
      phoneme,
      accented: ACCENTED_VOWELS.includes(grapheme),
    })),
  );
