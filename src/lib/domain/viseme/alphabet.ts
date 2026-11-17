import type { Phoneme } from '@/lib/domain/g2p';

export type Letter = {
  readonly letter: string;
  /** Sounds the letter can stand for, most frequent first. Empty for a silent letter. */
  readonly sounds: readonly Phoneme[];
  readonly note?: string;
};

/** The Spanish alphabet as a speech therapist's chart teaches it, plus the digraphs. Peninsular. */
export const ALPHABET: readonly Letter[] = [
  { letter: 'A', sounds: ['a'] },
  { letter: 'B', sounds: ['b'] },
  { letter: 'C', sounds: ['k', 'θ'], note: 'ca, co, cu: /k/ · ce, ci: /θ/' },
  { letter: 'D', sounds: ['d'] },
  { letter: 'E', sounds: ['e'] },
  { letter: 'F', sounds: ['f'] },
  { letter: 'G', sounds: ['ɡ', 'x'], note: 'ga, go, gu: /ɡ/ · ge, gi: /x/' },
  { letter: 'H', sounds: [], note: 'muda' },
  { letter: 'I', sounds: ['i'] },
  { letter: 'J', sounds: ['x'] },
  { letter: 'K', sounds: ['k'] },
  { letter: 'L', sounds: ['l'] },
  { letter: 'M', sounds: ['m'] },
  { letter: 'N', sounds: ['n'] },
  { letter: 'Ñ', sounds: ['ɲ'] },
  { letter: 'O', sounds: ['o'] },
  { letter: 'P', sounds: ['p'] },
  { letter: 'Q', sounds: ['k'], note: 'siempre qu' },
  { letter: 'R', sounds: ['ɾ', 'r'], note: 'entre vocales /ɾ/ · al inicio /r/' },
  { letter: 'S', sounds: ['s'] },
  { letter: 'T', sounds: ['t'] },
  { letter: 'U', sounds: ['u'] },
  { letter: 'V', sounds: ['b'], note: 'suena igual que la b' },
  { letter: 'W', sounds: ['w'] },
  { letter: 'X', sounds: ['k', 's'], note: '/ks/' },
  { letter: 'Y', sounds: ['ʝ', 'i'], note: 'ante vocal /ʝ/ · sola o final /i/' },
  { letter: 'Z', sounds: ['θ'] },
  { letter: 'CH', sounds: ['tʃ'] },
  { letter: 'LL', sounds: ['ʝ'], note: 'yeísmo; /ʎ/ donde se distingue' },
  { letter: 'RR', sounds: ['r'] },
];
