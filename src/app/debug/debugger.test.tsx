import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Debugger } from './debugger';

describe('Debugger', () => {
  it('shows the phonemes and the viseme timeline for the default word', () => {
    render(<Debugger />);
    expect(screen.getByText('/ˈpa.la/')).toBeInTheDocument();
    expect(screen.getAllByText('BILABIAL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('REST').length).toBeGreaterThan(0);
  });

  it('follows the seseo toggle', async () => {
    render(<Debugger />);
    await userEvent.clear(screen.getByLabelText('Palabra'));
    await userEvent.type(screen.getByLabelText('Palabra'), 'caza');
    expect(screen.getByText('/ˈka.θa/')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('seseo'));
    expect(screen.getByText('/ˈka.sa/')).toBeInTheDocument();
  });

  it('names the module and wiki page behind each stage', () => {
    render(<Debugger />);
    expect(screen.getByText(/src\/lib\/g2p/)).toBeInTheDocument();
    expect(screen.getByText('wiki-llm/visemes.md')).toBeInTheDocument();
    expect(screen.getByText(/toTimeline/)).toBeInTheDocument();
  });

  it('shows which sound produced which shape', () => {
    render(<Debugger />);
    const mapping = within(screen.getByRole('list', { name: 'Sonido a forma' }));
    expect(mapping.getByText('/p/').parentElement).toHaveTextContent(/\/p\/\s*→\s*BILABIAL/);
  });

  it('marks letters and sounds apart in the copy', () => {
    render(<Debugger />);
    expect(screen.getAllByTitle('letra escrita')[0]).toHaveTextContent('así');
    expect(screen.getAllByTitle('sonido pronunciado')[0]).toHaveTextContent('/aˈsi/');
  });

  it('reports the visible layers and their opacity', () => {
    render(<Debugger />);
    const layers = screen.getByRole('list', { name: 'Capas visibles' });
    expect(layers).toHaveTextContent('reposo REST 100%');
  });

  it('jumps to a posture when its block is clicked', async () => {
    render(<Debugger />);
    await userEvent.click(screen.getByTitle(/^BILABIAL /));
    expect(screen.getByRole('img')).toHaveAccessibleName('/p/ · BILABIAL');
  });

  it('offers Hablar before playback and Pausa while speaking', async () => {
    render(<Debugger />);
    await userEvent.click(screen.getByRole('button', { name: 'Hablar' }));
    expect(screen.getByRole('button', { name: 'Pausa' })).toBeInTheDocument();
  });

  it('copies every adjustment to the clipboard in one click', async () => {
    const user = userEvent.setup();
    render(<Debugger />);

    await user.click(screen.getByRole('button', { name: 'Copiar ajustes' }));

    const copied = await navigator.clipboard.readText();
    expect(copied).toContain('palabra: pala');
    expect(copied).toContain('velocidad: x1.00');
    expect(copied).toContain('género preferido: mujer');
    expect(copied).not.toContain('síl/s del sintetizador');
    expect(screen.getByRole('button', { name: 'Copiar ajustes' })).toHaveTextContent('copiado');
  });

  it('rests the mouth before playback starts', () => {
    render(<Debugger />);
    expect(screen.getByRole('img')).toHaveAccessibleName('reposo · REST');
  });

  it('holds a letter of the alphabet still on the face', async () => {
    render(<Debugger />);
    const alphabet = within(screen.getByRole('list', { name: 'Alfabeto' }));
    await userEvent.click(alphabet.getAllByRole('button', { name: '/ɲ/' })[0]!);
    expect(screen.getByRole('img')).toHaveAccessibleName('/ɲ/ · quieta');
  });
});
