'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useArticulation, type Articulation } from '@/components/articulation';
import { Face } from '@/components/face';
import { Player } from '@/components/player';
import { useMuted } from '@/components/voice';
import { DIFFICULTY_RANGE } from '@/lib/application/games/adivina/level';
import { SMILE_SHAPE } from '@/lib/domain/mouth';

// Once the learner has played a round, every following round starts itself — clicking play
// on each one is pure friction. First round still waits for a click ("escucha a la logopeda").
const AUTOPLAY_DELAY_MS = 1000;
const NATURAL_SPEED = 1;
const GAME_AIR_OPACITY = 0.35;

const noSubscription = () => () => {};

// The first round must render identically on the server and on the client's hydration
// pass, so it can't come from Math.random. useSyncExternalStore is the sanctioned way to
// read a value that legitimately differs between the two without a hydration mismatch.
const useHasMounted = (): boolean =>
  useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );

export const useSeededGame = <S,>(create: (rng: () => number) => S) => {
  const hasMounted = useHasMounted();
  const [state, setState] = useState<S>(() => create(() => 0));
  const [seeded, setSeeded] = useState(false);
  if (hasMounted && !seeded) {
    setSeeded(true);
    setState(create(Math.random));
  }
  return [state, setState] as const;
};

export type RoundPlayer = {
  readonly articulation: Articulation;
  readonly velocidad: number;
  readonly setVelocidad: (value: number) => void;
  readonly revealed: boolean;
  readonly muted: boolean;
  readonly setMuted: (muted: boolean) => void;
  readonly toggle: () => void;
};

// `round` must change identity exactly when a new round starts: that resets speed and the lock.
export const useRoundPlayer = (
  round: unknown,
  text: string,
  {
    exaggeration,
    difficultyOffset,
  }: { readonly exaggeration: number; readonly difficultyOffset: number },
): RoundPlayer => {
  const [trackedRound, setTrackedRound] = useState(round);
  const [velocidad, setVelocidad] = useState(NATURAL_SPEED);
  const [revealed, setRevealed] = useState(false);
  // Armed by the learner's first manual play; from then on every new round starts itself.
  const [autoplayArmed, setAutoplayArmed] = useState(false);

  const roundChanged = trackedRound !== round;
  if (roundChanged) {
    setTrackedRound(round);
    setVelocidad(NATURAL_SPEED);
    setRevealed(false);
  }

  const [muted, setMuted] = useMuted();
  // Fractional utterance volume is silent in Chrome, so DIFICULTAD gates the voice rather
  // than fading it: audible up to Media, off at Difícil.
  const voiceOff = muted || difficultyOffset >= DIFFICULTY_RANGE.hardest;

  const articulation = useArticulation(text, {
    speed: velocidad,
    exaggeration,
    idleShape: SMILE_SHAPE,
    voice: { enabled: !voiceOff },
  });

  if (roundChanged) articulation.reset();

  const { play: playArticulation, playing } = articulation;
  useEffect(() => {
    if (!autoplayArmed || playing || revealed) return;
    const timer = setTimeout(() => {
      playArticulation();
      setRevealed(true);
    }, AUTOPLAY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [round, autoplayArmed, playing, revealed, playArticulation]);

  const toggle = () => {
    if (playing) {
      articulation.pause();
      return;
    }
    setAutoplayArmed(true);
    playArticulation();
    setRevealed(true);
  };

  return { articulation, velocidad, setVelocidad, revealed, muted, setMuted, toggle };
};

export const RoundStage = ({
  player,
  silencedLabel,
  lockedHint,
}: {
  readonly player: RoundPlayer;
  readonly silencedLabel: string;
  readonly lockedHint: string;
}) => {
  const { articulation, muted, setMuted, toggle, revealed } = player;
  return (
    <>
      <Player
        playing={articulation.playing}
        onToggle={toggle}
        silenced={articulation.silenced}
        silencedLabel={silencedLabel}
        muted={muted}
        onMuteToggle={articulation.voice.supported ? () => setMuted(!muted) : undefined}
      >
        <div className="overflow-hidden rounded-4xl border border-edge bg-[radial-gradient(125%_125%_at_50%_16%,var(--color-stage),var(--color-stage-edge))] px-6 pt-6 shadow-md">
          <Face
            shape={articulation.shape}
            airOpacity={GAME_AIR_OPACITY}
            alive
            speaking={articulation.playing}
            label={articulation.label}
            className="mx-auto h-64 w-auto drop-shadow-sm sm:h-80 lg:h-[22rem]"
          />
        </div>
      </Player>

      {!revealed && (
        <p className="mt-6 text-center text-sm font-medium text-ink-soft" role="status">
          {lockedHint}
        </p>
      )}
    </>
  );
};
