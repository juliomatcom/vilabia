import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SHAPES } from '@/lib/domain/mouth';
import { SHAPES_PROMPT } from './prompts';
import { Tuner } from './tuner';

describe('Tuner', () => {
  it('offers every sound of a viseme on its own and reports edits for the chosen one', async () => {
    const onSelect = jest.fn();
    const onChange = jest.fn();
    render(
      <Tuner
        shapes={SHAPES}
        selected="b"
        onSelect={onSelect}
        onChange={onChange}
        onReset={jest.fn()}
      />,
    );

    ['/p/', '/b/', '/m/'].forEach((label) =>
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: '/b/' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('grosor labio superior')).toHaveValue(String(SHAPES.b.upperLip));

    await userEvent.click(screen.getByRole('button', { name: '/m/' }));
    expect(onSelect).toHaveBeenCalledWith('m');
  });

  it('copies the whole table as it stands, without printing it on the page', async () => {
    const user = userEvent.setup();
    const edited = { ...SHAPES, o: { ...SHAPES.o, round: 0.42 } };
    render(
      <Tuner
        shapes={edited}
        selected="o"
        onSelect={jest.fn()}
        onChange={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    expect(screen.queryByText(/sound,open,width/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Copiar tabla de formas' }));

    const copied = await navigator.clipboard.readText();
    expect(copied.split('\n')[0]).toBe(SHAPES_PROMPT);
    expect(copied).toContain('sound,open,width');
    expect(copied).toContain('θ,');
    expect(copied).toContain('0.42');
  });
});
