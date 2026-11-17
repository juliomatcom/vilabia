import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CONSTRUYE_ROUNDS } from '@/lib/application/games/frases/construye';
import { tokenize } from '@/lib/application/games/frases/ordena';
import { ConstruyeScreen } from './screen';

const first = CONSTRUYE_ROUNDS[0];
const pile = () => within(screen.getByRole('list', { name: 'Palabras' }));
const tap = async (word: string) => {
  const chip = pile()
    .getAllByRole('button', { name: word })
    .find((button) => !(button as HTMLButtonElement).disabled);
  if (!chip) throw new Error(`no free chip for ${word}`);
  await userEvent.click(chip);
};

describe('Construye la frase screen', () => {
  it('deals the sentence’s words plus extra words, with one slot per sentence word', () => {
    render(<ConstruyeScreen />);
    const words = tokenize(first?.sentence ?? '');
    expect(pile().getAllByRole('button')).toHaveLength(words.length + (first?.extraCount ?? 0));
    expect(
      within(screen.getByRole('list', { name: 'Tu frase' })).getAllByRole('listitem'),
    ).toHaveLength(words.length);
  });

  it('passes with only the sentence’s words, the extras left in the pile', async () => {
    render(<ConstruyeScreen />);
    await userEvent.click(screen.getByRole('button', { name: 'Reproducir' }));
    for (const token of tokenize(first?.sentence ?? '')) await tap(token.text);
    expect(screen.getByRole('status')).toHaveTextContent('¡Muy bien!');
    expect(pile().getAllByRole('button')).toHaveLength(first?.extraCount ?? 0);
  });
});
