/**
 * Sentence sets authored by speech therapists, kept as data so they are edited in
 * `phrases.json`, never by rule. `encuentraFrase` and `ordena` come from Alberto Abarca's
 * «Frases 1» and «Frases 2» slides; `porSilaba` from Cristina Vega and Goretti Rodríguez's
 * «Frases por sílabas».
 */
import phrases from './phrases.json';

export type SyllableGroup = {
  readonly syllables: readonly string[];
  readonly sentences: readonly string[];
};

export type FindSentence = {
  readonly deck: 'frases_1' | 'frases_2';
  readonly slide: number;
  readonly target: string;
  readonly cards: readonly string[];
};

export type PhraseCredits = {
  readonly porSilaba: string;
  readonly encuentraFrase: string;
  readonly ordena: string;
};

export const PHRASE_CREDITS: PhraseCredits = phrases.credits;

export const SYLLABLE_GROUPS: readonly SyllableGroup[] = phrases.porSilaba;

export const FIND_SENTENCES: readonly FindSentence[] = (['frases_1', 'frases_2'] as const).flatMap(
  (deck) => phrases.encuentraFrase[deck].map((entry) => ({ deck, ...entry })),
);

export const ORDER_SENTENCES: readonly string[] = phrases.ordena;
