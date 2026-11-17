import type { Phoneme } from '@/lib/domain/g2p';

export const VISEMES = [
  'REST',
  'BILABIAL',
  'LABIODENTAL',
  'INTERDENTAL',
  'DENTAL',
  'SIBILANT',
  'POSTALVEOLAR',
  'PALATAL',
  'VELAR',
  'A',
  'E',
  'I',
  'O',
  'U',
] as const;

export type Viseme = (typeof VISEMES)[number];

export const VISEME_OF: Readonly<Record<Phoneme, Viseme>> = {
  p: 'BILABIAL',
  b: 'BILABIAL',
  m: 'BILABIAL',
  f: 'LABIODENTAL',
  θ: 'INTERDENTAL',
  t: 'DENTAL',
  d: 'DENTAL',
  n: 'DENTAL',
  l: 'DENTAL',
  ɾ: 'DENTAL',
  r: 'DENTAL',
  s: 'SIBILANT',
  tʃ: 'POSTALVEOLAR',
  ʝ: 'PALATAL',
  ʎ: 'PALATAL',
  ɲ: 'PALATAL',
  k: 'VELAR',
  ɡ: 'VELAR',
  x: 'VELAR',
  a: 'A',
  e: 'E',
  i: 'I',
  j: 'I',
  o: 'O',
  u: 'U',
  w: 'U',
};
