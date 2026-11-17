import { render, screen } from '@testing-library/react';
import { Tip } from './tip';

describe('Tip', () => {
  it('renders its text under a Consejo label', () => {
    render(<Tip>Prueba el modo mudo</Tip>);
    expect(screen.getByText(/Consejo:/)).toBeInTheDocument();
    expect(screen.getByText(/Prueba el modo mudo/)).toBeInTheDocument();
  });
});
