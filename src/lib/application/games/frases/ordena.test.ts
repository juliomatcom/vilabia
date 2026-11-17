import { ORDER_SENTENCES, SYLLABLE_GROUPS } from '@/lib/domain/phrases';
import {
  byLength,
  check,
  clearSlots,
  createOrdena,
  lengthSteps,
  nextOrdena,
  ORDENA_SENTENCES,
  ORDENA_LEVELS,
  place,
  placeAndCheck,
  shuffleTokens,
  slotMarks,
  startAt,
  tokenize,
  wordCount,
  unplace,
  type OrdenaState,
} from './ordena';

const placeAll = (state: OrdenaState, ids: readonly number[]): OrdenaState =>
  ids.reduce((game, id) => place(game, id), state);

const solve = (state: OrdenaState): OrdenaState =>
  check(
    placeAll(
      state,
      state.answer.map((token) => token.id),
    ),
  );

const texts = (tokens: readonly { readonly text: string }[]): string =>
  tokens.map((token) => token.text).join(' ');

describe('Ordena la frase levels', () => {
  it('uses every authored sentence of three words or more, from both documents', () => {
    const authored = [...SYLLABLE_GROUPS.flatMap((group) => group.sentences), ...ORDER_SENTENCES];
    expect(ORDENA_SENTENCES.every((sentence) => authored.includes(sentence))).toBe(true);
    expect(ORDER_SENTENCES.every((sentence) => ORDENA_SENTENCES.includes(sentence))).toBe(true);
    expect(ORDENA_SENTENCES).toHaveLength(
      authored.filter((sentence) => wordCount(sentence) >= 3).length,
    );
    expect(ORDENA_SENTENCES).not.toContain('Lola suma.');
  });

  it('opens on the shortest sentences and never gets shorter', () => {
    const counts = ORDENA_SENTENCES.map(wordCount);
    expect(counts[0]).toBe(3);
    expect(counts.every((count, index) => index === 0 || count >= (counts[index - 1] ?? 0))).toBe(
      true,
    );
  });

  it('keeps authored order among sentences of the same length and drops repeats', () => {
    expect(byLength(['b c d e', 'a b c', 'x y z', 'a b c', 'a b'])).toEqual([
      'a b c',
      'x y z',
      'b c d e',
    ]);
  });

  it('marks where each length starts', () => {
    const steps = lengthSteps();
    expect(steps[0]).toEqual({ words: 3, level: 1 });
    expect(steps.map((step) => step.words)).toEqual([...new Set(ORDENA_SENTENCES.map(wordCount))]);
    steps.forEach((step) =>
      expect(wordCount(ORDENA_SENTENCES[step.level - 1] as string)).toBe(step.words),
    );
  });

  it('jumps to any level keeping the difficulty', () => {
    const game = startAt(createOrdena(Math.random, { difficultyOffset: 5 }), 40);
    expect(game.level).toBe(40);
    expect(game.sentence).toBe(ORDENA_SENTENCES[39]);
    expect(game.difficultyOffset).toBe(5);
  });
});

describe('Ordena la frase', () => {
  it('splits a sentence into words without punctuation', () => {
    expect(texts(tokenize('¿Has visto, Ana, la tele?'))).toBe('has visto ana la tele');
  });

  it('shows every word in lowercase: no capital singles a chip out', () => {
    expect(
      ORDENA_SENTENCES.flatMap((sentence) => tokenize(sentence)).filter((token) =>
        /\p{Lu}/u.test(token.text),
      ),
    ).toEqual([]);
  });

  it('never offers the words already in order', () => {
    const rng = () => 0.5;
    ORDENA_SENTENCES.forEach((sentence) => {
      const tokens = tokenize(sentence);
      expect(texts(shuffleTokens(tokens, rng))).not.toBe(texts(tokens));
      expect(texts(shuffleTokens(tokens, Math.random))).not.toBe(texts(tokens));
    });
  });

  it('keeps every word when shuffling', () => {
    const tokens = tokenize(ORDENA_SENTENCES[2] as string);
    expect(texts([...shuffleTokens(tokens, Math.random)].sort((a, b) => a.id - b.id))).toBe(
      texts(tokens),
    );
  });

  it('fills slots in order and frees them on demand', () => {
    const game = createOrdena();
    const [first, second] = game.shuffled;
    const placed = placeAll(game, [first?.id as number, second?.id as number]);
    expect(placed.slots.slice(0, 2)).toEqual([first?.id, second?.id]);
    expect(place(placed, first?.id as number)).toBe(placed);
    expect(unplace(placed, 0).slots[0]).toBeUndefined();
  });

  it('clears every slot a check has not confirmed', () => {
    const game = createOrdena();
    const ids = game.answer.map((token) => token.id);
    const checked = check(placeAll(game, [ids[1], ids[0], ...ids.slice(2)] as number[]));
    const refilled = placeAll(checked, [ids[1] as number]);
    const cleared = clearSlots(refilled);
    expect(cleared.slots.filter((slot) => slot !== undefined)).toHaveLength(ids.length - 2);
    expect(
      clearSlots(placeAll(game, ids.slice(0, 3))).slots.every((slot) => slot === undefined),
    ).toBe(true);
  });

  it('checks the sentence when its last word is placed', () => {
    const game = createOrdena();
    const ids = game.answer.map((token) => token.id);
    const almost = ids.slice(0, -1).reduce((state, id) => placeAndCheck(state, id), game);
    expect(almost.phase).toBe('arranging');
    expect(placeAndCheck(almost, ids.at(-1) as number).phase).toBe('correct');
    const wrong = [ids[1], ids[0], ...ids.slice(2)] as number[];
    expect(wrong.reduce((state, id) => placeAndCheck(state, id), game).phase).toBe('checked');
  });

  it('ignores a word that cannot be placed', () => {
    const game = placeAndCheck(createOrdena(), 0);
    expect(placeAndCheck(game, 0)).toBe(game);
  });

  it('only checks a full sentence', () => {
    const game = createOrdena();
    expect(check(place(game, 0))).toEqual(place(game, 0));
  });

  it('passes a correct order and advances the level', () => {
    const done = solve(createOrdena());
    expect(done.phase).toBe('correct');
    expect(done.score).toBe(done.answer.length);
    const next = nextOrdena(done);
    expect(next.level).toBe(2);
    expect(next.sentence).toBe(ORDENA_SENTENCES[1]);
  });

  it('scores words in the right place, keeps them and returns the rest', () => {
    const game = createOrdena();
    const ids = game.answer.map((token) => token.id);
    const swapped = [ids[1], ids[0], ...ids.slice(2)] as number[];
    const checked = check(placeAll(game, swapped));
    expect(checked.phase).toBe('checked');
    expect(checked.score).toBe(ids.length - 2);
    expect(checked.slots[0]).toBeUndefined();
    expect(checked.slots[1]).toBeUndefined();
    expect(checked.locked).not.toContain(0);
    expect(unplace(checked, 2)).toBe(checked);
    expect(nextOrdena(checked)).toBe(checked);
    const fixed = check(placeAll(checked, [ids[0] as number, ids[1] as number]));
    expect(fixed.phase).toBe('correct');
  });

  it('accepts a repeated word in either of its places', () => {
    const level = ORDENA_SENTENCES.indexOf('El paraguas de mi hermano no es de tela.') + 1;
    const game = createOrdena(Math.random, { level });
    const ids = game.answer.map((token) => token.id);
    const deIds = game.answer.filter((token) => token.text === 'de').map((token) => token.id);
    const crossed = ids.map((id) =>
      id === deIds[0] ? (deIds[1] as number) : id === deIds[1] ? (deIds[0] as number) : id,
    );
    const placed = placeAll(game, crossed);
    expect(slotMarks(placed).every(Boolean)).toBe(true);
    expect(check(placed).phase).toBe('correct');
  });

  it('plays every sentence end to end and finishes on the last', () => {
    const final = ORDENA_SENTENCES.reduce((game, sentence, index) => {
      expect(game.level).toBe(index + 1);
      expect(game.sentence).toBe(sentence);
      const done = solve(game);
      return index === ORDENA_SENTENCES.length - 1 ? done : nextOrdena(done);
    }, createOrdena());
    expect(final.finished).toBe(true);
    expect(final.level).toBe(ORDENA_LEVELS);
    expect(nextOrdena(final)).toBe(final);
  });
});
