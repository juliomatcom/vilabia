import type { Phoneme } from '@/lib/domain/g2p';

export const BASE_MS: Readonly<Record<Phoneme, number>> = {
  a: 130,
  e: 130,
  i: 120,
  o: 130,
  u: 120,
  j: 70,
  w: 70,
  p: 85,
  b: 85,
  t: 80,
  d: 80,
  k: 90,
  ɡ: 90,
  f: 120,
  θ: 120,
  s: 125,
  x: 120,
  tʃ: 130,
  ʝ: 95,
  ʎ: 95,
  m: 95,
  n: 80,
  ɲ: 100,
  l: 80,
  ɾ: 40,
  r: 125,
};

export const STRESS_FACTOR = 1.3;
export const LEAD_IN_MS = 150;
export const TAIL_MS = 250;
export const INTER_WORD_MS = 120;
