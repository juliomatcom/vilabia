import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './sidebar';

jest.mock('next/navigation', () => ({ usePathname: () => '/' }));

describe('Sidebar', () => {
  it('links the active items', () => {
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: /inicio/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /juegos/i })).toHaveAttribute('href', '/juegos');
  });

  it('renders progreso and perfil as disabled, not links', () => {
    render(<Sidebar />);
    expect(screen.queryByRole('link', { name: /progreso/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /mi perfil/i })).not.toBeInTheDocument();
    expect(screen.getByText('PROGRESO')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('MI PERFIL')).toHaveAttribute('aria-disabled', 'true');
  });

  it('toggles the collapsed mobile menu', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    const toggle = screen.getByRole('button', { name: /abrir menú/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: /cerrar menú/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
