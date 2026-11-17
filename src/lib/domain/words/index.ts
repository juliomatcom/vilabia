import type { Viseme } from '@/lib/domain/viseme';
import words from './words.json';
import { sequenceOf } from './sequence';

export { sequenceOf } from './sequence';

export type BankWord = {
  readonly word: string;
  readonly sequence: readonly Viseme[];
};

export const WORDS: readonly string[] = words;

export const toBank = (spellings: readonly string[]): readonly BankWord[] =>
  spellings.map((word) => ({ word, sequence: sequenceOf(word) }));

export const BANK: readonly BankWord[] = toBank(WORDS);
