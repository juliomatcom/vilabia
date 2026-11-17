import type { Phoneme, Segment } from './types';

const VOWEL_PHONEMES: readonly Phoneme[] = ['a', 'e', 'i', 'o', 'u'];
const HIGH_VOWELS: readonly Phoneme[] = ['i', 'u'];
const GLIDES: Readonly<Partial<Record<Phoneme, Phoneme>>> = { i: 'j', u: 'w' };
const ONSET_CLUSTERS: readonly string[] = [
  'pl',
  'bl',
  'fl',
  'kl',
  'ɡl',
  'pɾ',
  'bɾ',
  'fɾ',
  'kɾ',
  'ɡɾ',
  'tɾ',
  'dɾ',
];

export type ProtoSyllable = {
  readonly phonemes: readonly Phoneme[];
  readonly accented: boolean;
};

type Chunk = {
  readonly vowel: boolean;
  readonly segments: readonly Segment[];
};

const isVowel = (segment: Segment): boolean => VOWEL_PHONEMES.includes(segment.phoneme);

const isGlideCandidate = (segment: Segment): boolean =>
  HIGH_VOWELS.includes(segment.phoneme) && !segment.accented;

const joinsNucleus = (nucleus: readonly Segment[], next: Segment): boolean =>
  isGlideCandidate(nucleus[nucleus.length - 1]) || isGlideCandidate(next);

const toChunks = (segments: readonly Segment[]): readonly Chunk[] =>
  segments.reduce<readonly Chunk[]>((chunks, segment) => {
    const vowel = isVowel(segment);
    const open = chunks[chunks.length - 1];
    const continues =
      open !== undefined &&
      open.vowel === vowel &&
      (!vowel || joinsNucleus(open.segments, segment));
    return continues
      ? [...chunks.slice(0, -1), { vowel, segments: [...open.segments, segment] }]
      : [...chunks, { vowel, segments: [segment] }];
  }, []);

const onsetSize = (cluster: readonly Segment[]): number =>
  cluster.length < 2
    ? cluster.length
    : ONSET_CLUSTERS.includes(
          cluster
            .slice(-2)
            .map((segment) => segment.phoneme)
            .join(''),
        )
      ? 2
      : 1;

const onsetOf = (chunk: Chunk | undefined, isLeading: boolean): readonly Segment[] =>
  chunk === undefined || chunk.vowel
    ? []
    : isLeading
      ? chunk.segments
      : chunk.segments.slice(chunk.segments.length - onsetSize(chunk.segments));

const codaOf = (chunk: Chunk | undefined, isTrailing: boolean): readonly Segment[] =>
  chunk === undefined || chunk.vowel
    ? []
    : isTrailing
      ? chunk.segments
      : chunk.segments.slice(0, chunk.segments.length - onsetSize(chunk.segments));

const peakIndex = (nucleus: readonly Segment[]): number => {
  const accented = nucleus.findIndex((segment) => segment.accented);
  const strong = nucleus.findIndex((segment) => !HIGH_VOWELS.includes(segment.phoneme));
  return accented >= 0 ? accented : strong >= 0 ? strong : nucleus.length - 1;
};

const nucleusPhonemes = (nucleus: readonly Segment[]): readonly Phoneme[] =>
  nucleus.map((segment, index) =>
    index === peakIndex(nucleus) ? segment.phoneme : (GLIDES[segment.phoneme] ?? segment.phoneme),
  );

export const toProtoSyllables = (segments: readonly Segment[]): readonly ProtoSyllable[] => {
  const chunks = toChunks(segments);
  return chunks.flatMap((chunk, index) =>
    chunk.vowel
      ? [
          {
            phonemes: [
              ...onsetOf(chunks[index - 1], index === 1).map((segment) => segment.phoneme),
              ...nucleusPhonemes(chunk.segments),
              ...codaOf(chunks[index + 1], index === chunks.length - 2).map(
                (segment) => segment.phoneme,
              ),
            ],
            accented: chunk.segments.some((segment) => segment.accented),
          },
        ]
      : [],
  );
};
