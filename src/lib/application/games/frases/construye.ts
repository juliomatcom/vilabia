import { FIND_SENTENCES, SYLLABLE_GROUPS } from '@/lib/domain/phrases';
import { tokenize, wordCount, type WordRound } from './ordena';

// Two words have one wrong order only: a swap, not a puzzle.
const MIN_WORDS = 3;

const wordsOf = (sentence: string): readonly string[] => tokenize(sentence).map((t) => t.text);

export const extrasFor = (sentence: string, neighbours: readonly string[]): readonly string[] => {
  const own = wordsOf(sentence);
  const words = neighbours.flatMap(wordsOf).filter((word) => !own.includes(word));
  return words.filter((word, index) => words.indexOf(word) === index);
};

export const extraCountFor = (words: number): number => (words <= 4 ? 2 : words <= 6 ? 3 : 4);

type Candidate = { readonly sentence: string; readonly extras: readonly string[] };

// Extras come only from authored sentences (group-mates, look-alike cards): never written by rule.
const CANDIDATES: readonly Candidate[] = [
  ...SYLLABLE_GROUPS.flatMap((group) =>
    group.sentences.map((sentence) => ({
      sentence,
      extras: extrasFor(
        sentence,
        group.sentences.filter((other) => other !== sentence),
      ),
    })),
  ),
  ...FIND_SENTENCES.map((entry) => ({
    sentence: entry.target,
    extras: extrasFor(entry.target, entry.cards),
  })),
];

export const toRounds = (candidates: readonly Candidate[]): readonly WordRound[] =>
  candidates
    .map(({ sentence }) => sentence)
    .filter((sentence, index, all) => all.indexOf(sentence) === index)
    .map((sentence, index) => {
      const extras = candidates
        .filter((candidate) => candidate.sentence === sentence)
        .flatMap((candidate) => candidate.extras);
      const unique = extras.filter((word, at) => extras.indexOf(word) === at);
      const words = wordCount(sentence);
      return {
        index,
        words,
        round: {
          sentence,
          extras: unique,
          extraCount: Math.min(unique.length, extraCountFor(words)),
        },
      };
    })
    .filter(({ words, round }) => words >= MIN_WORDS && round.extraCount > 0)
    .sort((a, b) => a.words - b.words || a.index - b.index)
    .map(({ round }) => round);

export const CONSTRUYE_ROUNDS: readonly WordRound[] = toRounds(CANDIDATES);

export const CONSTRUYE_LEVELS = CONSTRUYE_ROUNDS.length;
