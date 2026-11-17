import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ORDENA_SENTENCES, tokenize } from '@/lib/application/games/frases/ordena';
import { OrdenaScreen } from './screen';

const pileButton = (word: string): HTMLElement => {
  const pile = screen.getByRole('list', { name: 'Palabras' });
  const match = within(pile)
    .getAllByRole('button', { name: word })
    .find((button) => !(button as HTMLButtonElement).disabled);
  if (!match) throw new Error(`no free chip for ${word}`);
  return match;
};

describe('Ordena la frase screen', () => {
  it('locks the words until the learner plays the avatar', async () => {
    render(<OrdenaScreen />);
    const [first] = tokenize(ORDENA_SENTENCES[0] ?? '');
    expect(
      within(screen.getByRole('list', { name: 'Palabras' })).getByRole('button', {
        name: first?.text,
      }),
    ).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Comprobar' })).not.toBeInTheDocument();
  });

  it('checks by itself when the last word is placed, and passes the right order', async () => {
    render(<OrdenaScreen />);
    await userEvent.click(screen.getByRole('button', { name: 'Reproducir' }));
    const [last, ...firsts] = [...tokenize(ORDENA_SENTENCES[0] ?? '')].reverse();
    for (const token of [...firsts].reverse()) {
      await userEvent.click(pileButton(token.text));
    }
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(pileButton(last?.text ?? ''));
    expect(screen.getByRole('status')).toHaveTextContent('¡Muy bien!');
  });

  it('scores a wrong order and sends the misplaced words back', async () => {
    render(<OrdenaScreen />);
    await userEvent.click(screen.getByRole('button', { name: 'Reproducir' }));
    const [a, b, ...rest] = tokenize(ORDENA_SENTENCES[0] ?? '');
    for (const token of [b, a, ...rest]) {
      await userEvent.click(pileButton(token?.text ?? ''));
    }
    expect(screen.getByRole('status')).toHaveTextContent(`${rest.length} de ${rest.length + 2}`);
    expect(pileButton(a?.text ?? '')).toBeEnabled();
  });

  it('opens on a short sentence and jumps to any length', async () => {
    render(<OrdenaScreen />);
    expect(screen.getByRole('button', { name: 'Frases de 3 palabras' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Frases de 8 palabras' }));
    expect(screen.getByRole('button', { name: 'Frases de 8 palabras' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      within(screen.getByRole('list', { name: 'Palabras' })).getAllByRole('button'),
    ).toHaveLength(8);
  });
});
