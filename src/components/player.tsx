'use client';

import type { ReactNode } from 'react';
import { MuteIcon, PlayIcon, SoundIcon } from './icons';

export const Player = ({
  playing,
  onToggle,
  silenced = false,
  silencedLabel = 'Sin voz',
  muted,
  onMuteToggle,
  children,
}: {
  readonly playing: boolean;
  readonly onToggle: () => void;
  /** The avatar articulates without sound. Shown as a struck-through speaker. */
  readonly silenced?: boolean;
  readonly silencedLabel?: string;
  /** Current app-wide mute. Omit `onMuteToggle` to hide the control entirely. */
  readonly muted?: boolean;
  /** Present means the learner can mute; absent hides the toggle (no `speechSynthesis`). */
  readonly onMuteToggle?: () => void;
  readonly children: ReactNode;
}) => (
  <div className="relative">
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? 'Pausar' : 'Reproducir'}
      className="relative block min-h-72 w-full min-w-72 text-left"
    >
      {children}
      <span
        aria-hidden="true"
        className={`border-brand absolute top-5 left-5 flex h-16 w-16 items-center justify-center rounded-full border-4 bg-white/75 shadow-lg transition-opacity duration-300 ${
          playing ? 'pointer-events-none opacity-0' : 'cursor-pointer opacity-100'
        }`}
      >
        <PlayIcon className="text-brand h-7 w-7 translate-x-0.5" />
      </span>
    </button>
    {onMuteToggle !== undefined ? (
      <button
        type="button"
        onClick={onMuteToggle}
        aria-pressed={muted}
        aria-label={muted ? 'Activar sonido' : 'Silenciar'}
        title={silenced && !muted ? silencedLabel : undefined}
        className="border-brand absolute top-5 right-5 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-4 bg-white/75 shadow-lg"
      >
        {muted || silenced ? (
          <MuteIcon className="text-ink-soft h-7 w-7" />
        ) : (
          <SoundIcon className="text-brand h-7 w-7" />
        )}
      </button>
    ) : (
      silenced && (
        <span
          title={silencedLabel}
          className="text-ink-soft pointer-events-none absolute top-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/75 shadow-md"
        >
          <MuteIcon className="h-6 w-6" />
          <span className="sr-only">{silencedLabel}</span>
        </span>
      )
    )}
  </div>
);
