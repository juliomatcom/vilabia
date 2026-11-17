import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FIND_SENTENCES, PHRASE_CREDITS } from '@/lib/domain/phrases';
import { QueFraseScreen } from './screen';

describe('¿Qué frase dijo? screen', () => {
  it('locks the four sentences until the learner plays the avatar', async () => {
    render(<QueFraseScreen />);
    const first = FIND_SENTENCES[0];
    const cards = first?.cards.map((card) => screen.getByRole('button', { name: card })) ?? [];
    expect(cards).toHaveLength(4);
    cards.forEach((card) => expect(card).toBeDisabled());
    expect(screen.getByText(/primero escucha a la logopeda/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reproducir' }));
    cards.forEach((card) => expect(card).toBeEnabled());
  });

  it('praises the right sentence and credits the author', async () => {
    render(<QueFraseScreen />);
    await userEvent.click(screen.getByRole('button', { name: 'Reproducir' }));
    await userEvent.click(screen.getByRole('button', { name: FIND_SENTENCES[0]?.target ?? '' }));
    expect(screen.getByRole('status')).toHaveTextContent('¡Muy bien!');
    expect(screen.getByText(/Nivel: 2 de 40/)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(PHRASE_CREDITS.encuentraFrase.slice(0, 14))),
    ).toBeInTheDocument();
  });
});
