import { render, screen } from '@testing-library/react';
import { GAMES } from '@/lib/application/games';
import { hasPreview } from './game-previews';
import Juegos from './page';

describe('game card previews', () => {
  it('gives every game its own preview', () => {
    expect(GAMES.filter((game) => !hasPreview(game.slug))).toEqual([]);
  });

  it('links every game from the portal', () => {
    render(<Juegos />);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(GAMES.map((game) => `/juegos/${game.slug}`));
  });
});
