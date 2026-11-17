import { render, screen } from '@testing-library/react';
import FormasDeLaBoca from './page';

describe('Formas de la boca', () => {
  it('renders the heading', () => {
    render(<FormasDeLaBoca />);
    expect(
      screen.getByRole('heading', { name: /las formas de la boca, letra a letra/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('shows the whole alphabet, Ñ included', () => {
    render(<FormasDeLaBoca />);
    const alphabet = screen.getByRole('list', { name: 'Alfabeto' });
    expect(alphabet.children).toHaveLength(30);
    expect(alphabet).toHaveTextContent('Ñ ñ');
    expect(alphabet).toHaveTextContent('/ɲ/');
  });

  it('teaches the bilabial homophenes and links to the game', () => {
    render(<FormasDeLaBoca />);
    expect(screen.getByText(/«pala», «bala» y «mala»/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /practicar con el juego/i })).toHaveAttribute(
      'href',
      '/juegos',
    );
  });

  it('emits LearningResource structured data', () => {
    const { container } = render(<FormasDeLaBoca />);
    const ld = container.querySelector('script[type="application/ld+json"]');
    expect(ld?.textContent).toContain('LearningResource');
  });
});
