import { answer, createGame, redraw } from './game';

describe('adivina game state', () => {
  it('advances the level on a correct answer and redraws', () => {
    const game = createGame(() => 0);
    const after = answer(game, game.round.target);
    expect(after.phase).toBe('correct');
    expect(after.level).toBe(2);
  });

  it('keeps the level on a wrong answer', () => {
    const game = createGame(() => 0);
    const wrongPick = game.round.options.find((word) => word !== game.round.target);
    const after = answer(game, wrongPick as string);
    expect(after.phase).toBe('wrong');
    expect(after.level).toBe(1);
  });

  it('redraw clears the phase without touching the level', () => {
    const game = answer(
      createGame(() => 0),
      'anything',
    );
    const next = redraw(game, () => 0.5);
    expect(next.phase).toBe('playing');
    expect(next.pick).toBeUndefined();
    expect(next.level).toBe(game.level);
  });
});
