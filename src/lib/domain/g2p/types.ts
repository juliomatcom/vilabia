export const PHONEMES = [
  'a',
  'e',
  'i',
  'o',
  'u',
  'j',
  'w',
  'p',
  'b',
  't',
  'd',
  'k',
  'ɡ',
  'f',
  'θ',
  's',
  'x',
  'tʃ',
  'ʝ',
  'ʎ',
  'm',
  'n',
  'ɲ',
  'l',
  'ɾ',
  'r',
] as const;

export type Phoneme = (typeof PHONEMES)[number];

export type Dialect = {
  readonly seseo: boolean;
  readonly yeismo: boolean;
};

export const DISTINCION: Dialect = { seseo: false, yeismo: true };
export const SESEO: Dialect = { seseo: true, yeismo: true };

export type Segment = {
  readonly phoneme: Phoneme;
  readonly accented: boolean;
};

export type Syllable = {
  readonly phonemes: readonly Phoneme[];
  readonly stressed: boolean;
};

export type Word = {
  readonly text: string;
  readonly syllables: readonly Syllable[];
};
