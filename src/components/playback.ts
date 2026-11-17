'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type Playback = {
  readonly elapsedMs: number;
  readonly playing: boolean;
  readonly play: () => void;
  readonly playFrom: (ms: number) => void;
  readonly pause: () => void;
  readonly seekTo: (ms: number) => void;
  readonly reset: () => void;
};

export const usePlayback = (totalMs: number): Playback => {
  const [playing, setPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [run, setRun] = useState(0);
  const origin = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const startedAt = performance.now() - origin.current;
    const frame = { id: 0 };
    const tick = () => {
      const value = performance.now() - startedAt;
      if (value >= totalMs) {
        setElapsedMs(totalMs);
        setPlaying(false);
        return;
      }
      setElapsedMs(value);
      frame.id = requestAnimationFrame(tick);
    };
    frame.id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.id);
  }, [playing, run, totalMs]);

  const playFrom = useCallback(
    (ms: number) => {
      origin.current = ms >= totalMs ? 0 : ms;
      setElapsedMs(origin.current);
      setRun((value) => value + 1);
      setPlaying(true);
    },
    [totalMs],
  );

  const play = useCallback(() => playFrom(elapsedMs), [playFrom, elapsedMs]);

  const pause = useCallback(() => setPlaying(false), []);

  const seekTo = useCallback((ms: number) => {
    origin.current = ms;
    setElapsedMs(ms);
    setRun((value) => value + 1);
  }, []);

  const reset = useCallback(() => {
    origin.current = 0;
    setElapsedMs(0);
    setPlaying(false);
  }, []);

  return { elapsedMs, playing, play, playFrom, pause, seekTo, reset };
};
