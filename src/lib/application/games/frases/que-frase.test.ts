import { FIND_SENTENCES } from '@/lib/domain/phrases';
import { answerQueFrase, createQueFrase, nextQueFrase, QUE_FRASE_LEVELS } from './que-frase';

const wrongPick = (options: readonly string[], target: string): string =>
  options.find((option) => option !== target) as string;

describe('¿Qué frase dijo?', () => {
  it('starts on the first slide of frases_1 with its four authored cards', () => {
    const game = createQueFrase(() => 0.3);
    expect(game.level).toBe(1);
    expect(game.round.target).toBe(FIND_SENTENCES[0]?.target);
    expect([...game.round.options].sort()).toEqual([...(FIND_SENTENCES[0]?.cards ?? [])].sort());
  });

  it('advances one level on a correct answer and holds on a wrong one', () => {
    const game = createQueFrase();
    const right = answerQueFrase(game, game.round.target);
    expect(right.phase).toBe('correct');
    expect(right.level).toBe(2);
    const wrong = answerQueFrase(game, wrongPick(game.round.options, game.round.target));
    expect(wrong.phase).toBe('wrong');
    expect(wrong.level).toBe(1);
  });

  it('ignores a second answer in the same round', () => {
    const game = answerQueFrase(createQueFrase(), 'x');
    expect(answerQueFrase(game, game.round.target)).toBe(game);
  });

  it('retries the same sentences after a wrong answer', () => {
    const game = createQueFrase();
    const retry = nextQueFrase(
      answerQueFrase(game, wrongPick(game.round.options, game.round.target)),
    );
    expect(retry.phase).toBe('playing');
    expect(retry.pick).toBeUndefined();
    expect(retry.round.target).toBe(game.round.target);
  });

  it('plays every level end to end and finishes on the last', () => {
    const final = FIND_SENTENCES.reduce((game, entry, index) => {
      expect(game.level).toBe(index + 1);
      expect(game.round.target).toBe(entry.target);
      return nextQueFrase(answerQueFrase(game, game.round.target));
    }, createQueFrase());
    expect(final.finished).toBe(true);
    expect(final.level).toBe(QUE_FRASE_LEVELS);
    expect(nextQueFrase(final)).toBe(final);
  });
});
