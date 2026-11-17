const DIGRAPHS: readonly string[] = ['ch', 'll', 'rr'];
const FRONT_VOWELS: readonly string[] = ['e', 'i', 'é', 'í'];
const SILENT_U_PAIRS: readonly string[] = ['qu', 'gu', 'gü'];

const graphemeAt = (word: string, index: number): string => {
  const pair = word.slice(index, index + 2);
  const takesPair =
    DIGRAPHS.includes(pair) ||
    (SILENT_U_PAIRS.includes(pair) && FRONT_VOWELS.includes(word.slice(index + 2, index + 3)));
  return takesPair ? pair : word.slice(index, index + 1);
};

export const toGraphemes = (word: string): readonly string[] => {
  const collect = (index: number, acc: readonly string[]): readonly string[] =>
    index >= word.length
      ? acc
      : ((grapheme) => collect(index + grapheme.length, [...acc, grapheme]))(
          graphemeAt(word, index),
        );
  return collect(0, []);
};
