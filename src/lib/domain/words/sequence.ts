import { DISTINCION, toPhonemes } from '@/lib/domain/g2p';
import { toVisemeCodes, type Viseme } from '@/lib/domain/viseme';

export const sequenceOf = (word: string): readonly Viseme[] =>
  toVisemeCodes(toPhonemes(word, DISTINCION));
