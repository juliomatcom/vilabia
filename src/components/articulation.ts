'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  articulate,
  frameAt,
  voiceCues,
  voiceFits,
  type Clip,
} from '@/lib/application/articulation';
import { langFor, MOUTH_LEAD_MS } from '@/lib/application/speech';
import { DISTINCION, type Dialect } from '@/lib/domain/g2p';
import { SHAPES, blend, type MouthShape, type ShapeTable, type Sound } from '@/lib/domain/mouth';
import type { Viseme } from '@/lib/domain/viseme';
import { useIdleWeight } from './idle-weight';
import { usePlayback, type Playback } from './playback';
import { useVoice, type Voice, type VoiceOptions } from './voice';

export type ArticulationOptions = {
  readonly dialect?: Dialect;
  readonly speed?: number;
  readonly interWordMs?: number;
  readonly crossfadeMs?: number;
  readonly exaggeration?: number;
  readonly shapes?: ShapeTable;
  /** Shown while not playing, instead of the pipeline's own rest/pause shape. Omit for pipeline-accurate output (e.g. `/debug`). */
  readonly idleShape?: MouthShape;
  /** Omit for a silent player. Present means spoken, unless `enabled` says otherwise. */
  readonly voice?: VoiceOptions;
  /** How far the mouth runs ahead of the voice, as real articulation leads its own sound. */
  readonly mouthLeadMs?: number;
};

export type Articulation = Playback &
  Clip & {
    readonly position: number;
    readonly shape: MouthShape;
    readonly label: Viseme;
    readonly sound: Sound;
    readonly voice: Voice;
    /**
     * The voice was asked for but will not be heard: no voice available, or this clip is
     * outside what the engine can stretch to. Silence beats a sound off the lips.
     */
    readonly silenced: boolean;
  };

export const useArticulation = (
  text: string,
  {
    dialect = DISTINCION,
    speed = 1,
    interWordMs,
    crossfadeMs,
    exaggeration,
    shapes = SHAPES,
    idleShape,
    voice,
    mouthLeadMs = MOUTH_LEAD_MS,
  }: ArticulationOptions = {},
): Articulation => {
  const clip = useMemo(
    () => articulate(text, { dialect, speed, interWordMs }),
    [text, dialect, speed, interWordMs],
  );
  const { totalMs } = clip;

  const playback = usePlayback(totalMs);
  const spokenVoice = useVoice({
    lang: langFor(dialect),
    ...voice,
    enabled: voice !== undefined && (voice.enabled ?? true),
  });
  const timers = useRef<readonly ReturnType<typeof setTimeout>[]>([]);

  const { playFrom, pause: pausePlayback, reset: resetPlayback } = playback;
  const stopVoice = spokenVoice.cancel;
  const say = spokenVoice.speak;
  const latencyMs = spokenVoice.latencyMs;
  const pace = spokenVoice.pace;

  const fits = useMemo(() => voiceFits(clip, pace), [clip, pace]);
  // Still scheduled while unmeasured: that first, silent pass is what measures the voice.
  const voiced = spokenVoice.active && fits;
  const heard = voiced && spokenVoice.pace !== undefined && !spokenVoice.measuring;
  const silenced = voice !== undefined && (voice.enabled ?? true) && !heard;

  const unschedule = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const play = useCallback(() => {
    unschedule();
    stopVoice();
    const fromMs = playback.elapsedMs > 0 && playback.elapsedMs < totalMs ? playback.elapsedMs : 0;
    const plan = voiced
      ? voiceCues(clip, { fromMs, mouthLeadMs, latencyMs })
      : { cues: [], delayMs: 0 };
    const schedule = (run: () => void, at: number) => setTimeout(run, Math.max(0, at));

    timers.current = plan.cues.map(({ atMs, ...cue }) => schedule(() => say(cue), atMs));
    if (plan.delayMs === 0) playFrom(fromMs);
    else timers.current = [...timers.current, schedule(() => playFrom(fromMs), plan.delayMs)];
  }, [
    playback.elapsedMs,
    totalMs,
    playFrom,
    unschedule,
    stopVoice,
    say,
    voiced,
    latencyMs,
    clip,
    mouthLeadMs,
  ]);

  const pause = useCallback(() => {
    unschedule();
    stopVoice();
    pausePlayback();
  }, [unschedule, stopVoice, pausePlayback]);

  const reset = useCallback(() => {
    unschedule();
    stopVoice();
    resetPlayback();
  }, [unschedule, stopVoice, resetPlayback]);

  useEffect(
    () => () => {
      unschedule();
      stopVoice();
    },
    [text, unschedule, stopVoice],
  );

  const playing = playback.playing;
  const position = Math.min(playback.elapsedMs, totalMs);
  const frame = frameAt(clip, position, { crossfadeMs, speed, exaggeration, shapes });
  const idleWeight = useIdleWeight(!playing && idleShape !== undefined);
  const shape =
    idleShape === undefined || idleWeight === 0
      ? frame.shape
      : blend(frame.shape, idleShape, idleWeight);

  return {
    ...clip,
    position,
    shape,
    label: frame.viseme,
    sound: frame.sound,
    ...playback,
    playing,
    play,
    pause,
    reset,
    voice: spokenVoice,
    silenced,
  };
};
