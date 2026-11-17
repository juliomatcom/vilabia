import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Player } from './player';

const noop = () => {};

describe('Player', () => {
  it('has no mute control when the caller passes no toggle', () => {
    render(
      <Player playing={false} onToggle={noop}>
        <div />
      </Player>,
    );

    expect(screen.queryByRole('button', { name: /silenciar|activar sonido/i })).toBeNull();
  });

  it('reflects the mute state on the toggle', () => {
    const { rerender } = render(
      <Player playing={false} onToggle={noop} muted={false} onMuteToggle={noop}>
        <div />
      </Player>,
    );

    const toggle = screen.getByRole('button', { name: 'Silenciar' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <Player playing={false} onToggle={noop} muted onMuteToggle={noop}>
        <div />
      </Player>,
    );

    expect(screen.getByRole('button', { name: 'Activar sonido' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('toggles mute without toggling play', async () => {
    const onMuteToggle = jest.fn();
    const onToggle = jest.fn();
    render(
      <Player playing={false} onToggle={onToggle} muted={false} onMuteToggle={onMuteToggle}>
        <div />
      </Player>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Silenciar' }));

    expect(onMuteToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('folds the silenced reason into the toggle instead of a second icon', () => {
    render(
      <Player
        playing={false}
        onToggle={noop}
        muted={false}
        onMuteToggle={noop}
        silenced
        silencedLabel="Sin voz"
      >
        <div />
      </Player>,
    );

    const toggle = screen.getByRole('button', { name: 'Silenciar' });
    expect(toggle).toHaveAttribute('title', 'Sin voz');
    expect(screen.getAllByTitle('Sin voz')).toHaveLength(1);
  });
});
