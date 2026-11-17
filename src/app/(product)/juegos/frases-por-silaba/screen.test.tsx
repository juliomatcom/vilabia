import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SYLLABLE_GROUPS } from '@/lib/domain/phrases';
import { PorSilabaScreen } from './screen';

describe('Frases por sílaba screen', () => {
  beforeEach(() => jest.spyOn(Math, 'random').mockReturnValue(0));
  afterEach(() => jest.restoreAllMocks());

  it('plays the first group and praises the right sentence', async () => {
    render(<PorSilabaScreen />);
    const target = SYLLABLE_GROUPS[0]?.sentences[0] ?? '';
    expect(screen.getByRole('button', { name: target })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Reproducir' }));
    await userEvent.click(screen.getByRole('button', { name: target }));
    expect(screen.getByRole('status')).toHaveTextContent('¡Muy bien!');
  });

  it('opens any sound group from the picker', async () => {
    render(<PorSilabaScreen />);
    await userEvent.click(screen.getByRole('button', { name: 'Sonido ma · mu · me · mi · mo' }));
    expect(screen.getByRole('button', { name: 'Sonido ma · mu · me · mi · mo' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      screen.getByRole('button', { name: SYLLABLE_GROUPS[4]?.sentences[0] ?? '' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Sonido 5 de 21/)).toBeInTheDocument();
  });
});
