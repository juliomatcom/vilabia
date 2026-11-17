import { FIND_SENTENCES, ORDER_SENTENCES, PHRASE_CREDITS, SYLLABLE_GROUPS } from './index';

const blank = (text: string): boolean => text.trim().length === 0;
const duplicates = (items: readonly string[]): readonly string[] =>
  items.filter((item, index) => items.indexOf(item) !== index);

describe('phrases por sílaba', () => {
  it('keeps the document’s twenty-one groups in order', () => {
    expect(SYLLABLE_GROUPS).toHaveLength(21);
    expect(SYLLABLE_GROUPS[0]?.syllables[0]).toBe('ba');
    expect(SYLLABLE_GROUPS.at(-1)?.syllables[0]).toBe('ga');
  });

  it('holds no empty syllable or sentence', () => {
    expect(SYLLABLE_GROUPS.filter((group) => group.syllables.length === 0)).toEqual([]);
    expect(SYLLABLE_GROUPS.flatMap((group) => group.sentences).filter(blank)).toEqual([]);
    expect(SYLLABLE_GROUPS.flatMap((group) => group.syllables).filter(blank)).toEqual([]);
  });

  it('gives every group at least two sentences to choose between', () => {
    expect(SYLLABLE_GROUPS.filter((group) => group.sentences.length < 2)).toEqual([]);
  });

  it('repeats no sentence within a group', () => {
    expect(SYLLABLE_GROUPS.flatMap((group) => duplicates(group.sentences))).toEqual([]);
  });
});

describe('encuentra la frase', () => {
  it('runs both decks in slide order, frases_1 first', () => {
    expect(FIND_SENTENCES).toHaveLength(40);
    expect(FIND_SENTENCES.slice(0, 15).every((entry) => entry.deck === 'frases_1')).toBe(true);
    expect(FIND_SENTENCES.map((entry) => entry.slide).slice(0, 3)).toEqual([15, 14, 13]);
    expect(FIND_SENTENCES[15]?.slide).toBe(25);
  });

  it('gives every entry four distinct, non-empty cards', () => {
    expect(FIND_SENTENCES.filter((entry) => entry.cards.length !== 4)).toEqual([]);
    expect(FIND_SENTENCES.flatMap((entry) => entry.cards).filter(blank)).toEqual([]);
    expect(FIND_SENTENCES.flatMap((entry) => duplicates(entry.cards))).toEqual([]);
  });

  it('has every target among its own cards', () => {
    expect(FIND_SENTENCES.filter((entry) => !entry.cards.includes(entry.target))).toEqual([]);
  });
});

describe('ordena la frase', () => {
  it('holds twenty distinct, non-empty sentences of several words', () => {
    expect(ORDER_SENTENCES).toHaveLength(20);
    expect(ORDER_SENTENCES.filter(blank)).toEqual([]);
    expect(duplicates(ORDER_SENTENCES)).toEqual([]);
    expect(ORDER_SENTENCES.filter((sentence) => sentence.split(/\s+/u).length < 3)).toEqual([]);
  });
});

describe('credits', () => {
  it('names the authors of every set', () => {
    expect(PHRASE_CREDITS.encuentraFrase).toContain('Alberto Abarca');
    expect(PHRASE_CREDITS.ordena).toContain('Alberto Abarca');
    expect(PHRASE_CREDITS.porSilaba).toContain('Cristina Vega');
    expect(PHRASE_CREDITS.porSilaba).toContain('Goretti Rodríguez');
  });
});
