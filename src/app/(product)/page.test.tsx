import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home', () => {
  it('renders the marketing headline', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /leer los labios/i, level: 1 })).toBeInTheDocument();
  });

  it('links to the game', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /empezar a practicar/i })).toHaveAttribute(
      'href',
      '/juegos',
    );
  });

  it('explains why lipreading matters and answers common questions', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: /por qué leer los labios importa/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /preguntas frecuentes/i })).toBeInTheDocument();
  });

  it('emits FAQ structured data', () => {
    const { container } = render(<Home />);
    const ld = container.querySelector('script[type="application/ld+json"]');
    expect(ld?.textContent).toContain('FAQPage');
  });
});
