import { FIND_SENTENCES, SYLLABLE_GROUPS } from '@/lib/domain/phrases';
import {
  CONSTRUYE_LEVELS,
  CONSTRUYE_ROUNDS,
  extraCountFor,
  extrasFor,
  toRounds,
} from './construye';
import {
  check,
  createOrdena,
  isFull,
  nextOrdena,
  place,
  tokenize,
  wordCount,
  type OrdenaState,
} from './ordena';

const play = (level: number): OrdenaState =>
  createOrdena(Math.random, { level, rounds: CONSTRUYE_ROUNDS });

const extraIds = (game: OrdenaState): readonly number[] =>
  game.shuffled.filter((token) => token.id >= game.answer.length).map((token) => token.id);

const solve = (game: OrdenaState): OrdenaState =>
  check(
    game.answer.reduce((state, token) => place(state, token.id), game),
    CONSTRUYE_ROUNDS,
  );

describe('Construye la frase rounds', () => {
  it('takes extras only from words the sentence does not have', () => {
    expect(extrasFor('Mi gato come', ['Mi pato come', 'Mi gata come.'])).toEqual(['pato', 'gata']);
  });

  it('deals more extras as sentences grow', () => {
    expect([3, 4, 5, 6, 7, 10].map(extraCountFor)).toEqual([2, 2, 3, 3, 4, 4]);
  });

  it('uses the slides’ look-alike words for a ¿Qué frase dijo? sentence', () => {
    const isla = CONSTRUYE_ROUNDS.find(
      (round) => round.sentence === 'En la isla había un tesoro debajo de una roca',
    );
    expect(isla?.extras).toEqual(expect.arrayContaining(['su', 'foca', 'cabía']));
  });

  it('plays every syllable sentence of three words or more and every slide target', () => {
    const sentences = CONSTRUYE_ROUNDS.map((round) => round.sentence);
    const syllable = SYLLABLE_GROUPS.flatMap((group) => group.sentences).filter(
      (sentence) => wordCount(sentence) >= 3,
    );
    expect(syllable.every((sentence) => sentences.includes(sentence))).toBe(true);
    expect(FIND_SENTENCES.every((entry) => sentences.includes(entry.target))).toBe(true);
    expect(new Set(sentences).size).toBe(sentences.length);
  });

  it('gives every round at least one extra, none of them a word of the sentence', () => {
    CONSTRUYE_ROUNDS.forEach((round) => {
      const own = tokenize(round.sentence).map((token) => token.text);
      expect(round.extraCount).toBeGreaterThan(0);
      expect(round.extraCount).toBeLessThanOrEqual(round.extras.length);
      expect(round.extras.filter((word) => own.includes(word))).toEqual([]);
    });
  });

  it('opens on the shortest sentences and never gets shorter', () => {
    const counts = CONSTRUYE_ROUNDS.map((round) => wordCount(round.sentence));
    expect(counts[0]).toBe(3);
    expect(counts.every((count, index) => index === 0 || count >= (counts[index - 1] ?? 0))).toBe(
      true,
    );
  });

  it('merges the extras of a sentence that appears in both decks', () => {
    expect(
      toRounds([
        { sentence: 'a b c', extras: ['x'] },
        { sentence: 'a b c', extras: ['y', 'x'] },
      ]),
    ).toEqual([{ sentence: 'a b c', extras: ['x', 'y'], extraCount: 2 }]);
  });
});

describe('Construye la frase play', () => {
  it('deals the sentence’s words plus the round’s extras', () => {
    const game = play(1);
    const round = CONSTRUYE_ROUNDS[0];
    expect(game.shuffled).toHaveLength(game.answer.length + (round?.extraCount ?? 0));
    expect(extraIds(game)).toHaveLength(round?.extraCount ?? 0);
    expect(game.slots).toHaveLength(game.answer.length);
  });

  it('never deals the sentence’s own words in order', () => {
    Array.from({ length: 30 }, () => play(1)).forEach((game) => {
      const own = game.shuffled.filter((token) => token.id < game.answer.length);
      expect(own.map((token) => token.text).join(' ')).not.toBe(
        game.answer.map((token) => token.text).join(' '),
      );
    });
  });

  it('marks an extra word wrong and sends it back to the pile', () => {
    const game = play(1);
    const [extra] = extraIds(game);
    const filled = game.answer
      .slice(1)
      .reduce((state, token) => place(state, token.id), place(game, extra as number));
    expect(isFull(filled)).toBe(true);
    const checked = check(filled, CONSTRUYE_ROUNDS);
    expect(checked.phase).toBe('checked');
    expect(checked.slots).not.toContain(extra);
  });

  it('passes with only the sentence’s words in order, and plays to the last level', () => {
    expect(solve(play(1)).phase).toBe('correct');
    const last = solve(play(CONSTRUYE_LEVELS));
    expect(last.finished).toBe(true);
    expect(nextOrdena(last, Math.random, CONSTRUYE_ROUNDS)).toBe(last);
    expect(nextOrdena(solve(play(1)), Math.random, CONSTRUYE_ROUNDS).level).toBe(2);
  });
});
