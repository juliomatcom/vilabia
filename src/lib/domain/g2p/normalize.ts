const RESPELLINGS: Readonly<Record<string, string>> = {
  méxico: 'méjico',
  mexicano: 'mejicano',
  mexicana: 'mejicana',
  mexicanos: 'mejicanos',
  mexicanas: 'mejicanas',
  texas: 'tejas',
  oaxaca: 'oajaca',
  ximena: 'jimena',
};

const WORD_PATTERN = /[a-záéíóúüñ]+/g;

export const toWords = (text: string): readonly string[] =>
  (text.toLowerCase().normalize('NFC').match(WORD_PATTERN) ?? []).map(
    (word) => RESPELLINGS[word] ?? word,
  );
