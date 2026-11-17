'use client';

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import {
  CALIBRATION_WORDS,
  MAX_LATENCY_MS,
  MEASURE_TIMEOUT_MS,
  NEUTRAL_RATE,
  fitPace,
  pickVoice,
  rateFor,
  type Gender,
  type Pace,
  type Sample,
  type VoiceInfo,
} from '@/lib/application/speech';

export type SpeakRequest = {
  readonly text: string;
  readonly lang: string;
  readonly rate: number;
  readonly volume: number;
  readonly voice: VoiceInfo;
  readonly onStart: () => void;
  readonly onEnd: () => void;
};

export type Speaker = {
  readonly supported: boolean;
  readonly voices: () => readonly VoiceInfo[];
  readonly subscribe: (listener: () => void) => () => void;
  readonly speak: (request: SpeakRequest) => void;
  readonly cancel: () => void;
};

export type VoiceMeasurement = {
  readonly voice: string;
  readonly rate: number;
  readonly targetMs: number;
  readonly measuredMs: number;
  /** What the voice spent speaking: `measuredMs` minus the overhead it adds to every utterance. */
  readonly spokenMs: number;
  /** `spokenMs` against the time the clip gave it. Positive means the voice ran long. */
  readonly driftMs: number;
  readonly syllablesPerSecond: number;
  readonly overheadMs: number;
  readonly latencyMs: number;
};

export type VoiceOptions = {
  readonly enabled?: boolean;
  readonly lang?: string;
  readonly name?: string;
  readonly gender?: Gender;
  readonly volume?: number;
  readonly onMeasure?: (measurement: VoiceMeasurement) => void;
  readonly speaker?: Speaker;
};

export type Utterance = {
  readonly text: string;
  readonly syllables: number;
  readonly targetMs: number;
};

export type Voice = {
  readonly supported: boolean;
  readonly available: readonly VoiceInfo[];
  readonly selected?: VoiceInfo;
  /** Whether a `speak` would actually be heard: enabled, supported, audible, voice found. */
  readonly active: boolean;
  /** Measured once per voice and then fixed, so the same clip always sounds the same. */
  readonly pace?: Pace;
  /** A silent measuring pass is running; this clip plays without sound. */
  readonly measuring: boolean;
  /** What this engine takes between `speak()` and the first sound, as measured so far. */
  readonly latencyMs: number;
  readonly speak: (utterance: Utterance) => boolean;
  readonly cancel: () => void;
  /** Drops what was learned about the current voice. Call when the voice changes. */
  readonly forget: () => void;
};

const NO_VOICES: readonly VoiceInfo[] = [];

const clampLatency = (ms: number): number => Math.min(MAX_LATENCY_MS, Math.max(0, ms));

const STORE_KEY = 'vilabia.voice.pace';

type Store = Readonly<Record<string, Pace>>;

const readStore = (): Store => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
};

/** Measuring costs a silent pass, so what a voice reveals is kept for its next session. */
const writePace = (name: string, pace: Pace) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...readStore(), [name]: pace }));
  } catch {
    return;
  }
};

const forgetStored = () => {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    return;
  }
};

/**
 * What the app knows about the engine's voices. One store for the whole app, not one per
 * player: the numbers belong to the engine, so a voice measured before any player mounted
 * is already known when the first one does.
 */
export type VoiceKnowledge = {
  readonly paces: Store;
  /** What each voice takes between `speak()` and its first sound. */
  readonly latencies: Readonly<Record<string, number>>;
  /** A silent measuring pass is running; clips play without sound while it does. */
  readonly measuring: boolean;
};

const UNKNOWN: VoiceKnowledge = { paces: {}, latencies: {}, measuring: false };

const learned = { value: undefined as VoiceKnowledge | undefined };
const voiceListeners = new Set<() => void>();

const knowledge = (): VoiceKnowledge => (learned.value ??= { ...UNKNOWN, paces: readStore() });

const publish = (next: VoiceKnowledge) => {
  learned.value = next;
  voiceListeners.forEach((listener) => listener());
};

const subscribeKnowledge = (listener: () => void): (() => void) => {
  voiceListeners.add(listener);
  return () => {
    voiceListeners.delete(listener);
  };
};

const learnPace = (name: string, pace: Pace) => {
  writePace(name, pace);
  publish({ ...knowledge(), paces: { ...knowledge().paces, [name]: pace } });
};

const learnLatency = (name: string, ms: number) => {
  const latency = clampLatency(ms);
  if (knowledge().latencies[name] === latency) return;
  publish({ ...knowledge(), latencies: { ...knowledge().latencies, [name]: latency } });
};

const setMeasuring = (measuring: boolean) => {
  if (knowledge().measuring === measuring) return;
  publish({ ...knowledge(), measuring });
};

const muteState = { value: false };
const muteListeners = new Set<() => void>();

const getMuted = (): boolean => muteState.value;

const subscribeMuted = (listener: () => void): (() => void) => {
  muteListeners.add(listener);
  return () => {
    muteListeners.delete(listener);
  };
};

/** One app-wide voice mute, shared by every `Player`. Deliberately not persisted: every load
 * starts with sound on, so a mute cannot follow a learner into a session they forgot about. */
export const setMuted = (value: boolean) => {
  muteState.value = value;
  muteListeners.forEach((listener) => listener());
};

export const useMuted = (): readonly [boolean, (value: boolean) => void] => [
  useSyncExternalStore(subscribeMuted, getMuted, () => false),
  setMuted,
];

export const SILENT_SPEAKER: Speaker = {
  supported: false,
  voices: () => NO_VOICES,
  subscribe: () => () => {},
  speak: () => {},
  cancel: () => {},
};

const describe = ({ name, lang, localService }: SpeechSynthesisVoice): VoiceInfo => ({
  name,
  lang,
  localService,
});

const createBrowserSpeaker = (synth: SpeechSynthesis): Speaker => {
  const cache = { native: [] as readonly SpeechSynthesisVoice[], info: NO_VOICES };
  const listeners = new Set<() => void>();
  const pending = { timer: undefined as ReturnType<typeof setTimeout> | undefined };

  const refresh = () => {
    const native = synth.getVoices();
    const same =
      native.length === cache.native.length &&
      native.every((voice, index) => voice.name === cache.native[index]?.name);
    if (same) return;
    cache.native = native;
    cache.info = native.map(describe);
    listeners.forEach((listener) => listener());
  };

  synth.addEventListener('voiceschanged', refresh);
  refresh();

  const clearPending = () => {
    clearTimeout(pending.timer);
    pending.timer = undefined;
  };

  return {
    supported: true,
    voices: () => cache.info,
    subscribe: (listener) => {
      listeners.add(listener);
      refresh();
      return () => {
        listeners.delete(listener);
      };
    },
    speak: ({ text, lang, rate, volume, voice, onStart, onEnd }) => {
      clearPending();
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.volume = volume;
      const native = cache.native.find((candidate) => candidate.name === voice.name);
      if (native !== undefined) utterance.voice = native;
      utterance.onstart = onStart;
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
      // Chrome drops an utterance queued in the same task as cancel().
      pending.timer = setTimeout(() => {
        pending.timer = undefined;
        synth.speak(utterance);
      }, 0);
    },
    cancel: () => {
      clearPending();
      synth.cancel();
    },
  };
};

const singleton = { speaker: undefined as Speaker | undefined };

export const browserSpeaker = (): Speaker => {
  if (typeof window === 'undefined' || window.speechSynthesis === undefined) return SILENT_SPEAKER;
  singleton.speaker ??= createBrowserSpeaker(window.speechSynthesis);
  return singleton.speaker;
};

const pass = {
  id: 0,
  running: false,
  timer: undefined as ReturnType<typeof setTimeout> | undefined,
};

/** Closes the current pass, so anything it still has in flight lands on a stale id. */
const endPass = () => {
  clearTimeout(pass.timer);
  pass.timer = undefined;
  pass.running = false;
  pass.id += 1;
  setMeasuring(false);
};

/**
 * One silent pass per voice, on two words of different lengths — the only way to tell a
 * voice's pace from the fixed silence it wraps every utterance in. Measured once and then
 * fixed: a rate that kept moving would make the same clip sound different on every press.
 *
 * Idempotent, and its state is module-level rather than a render value: a pass runs across
 * timers and engine events, and a clip fires one `speak` per word from closures built
 * before any state could have updated.
 */
export const measureVoice = (speaker: Speaker, voice: VoiceInfo) => {
  if (pass.running || knowledge().paces[voice.name] !== undefined) return;
  pass.running = true;
  const id = pass.id;
  setMeasuring(true);
  const samples: Sample[] = [];
  const next = (index: number) => {
    if (pass.id !== id) return;
    const word = CALIBRATION_WORDS[index];
    if (word === undefined) {
      const fitted = fitPace(samples, undefined);
      endPass();
      if (fitted !== undefined) learnPace(voice.name, fitted);
      return;
    }
    const at = { requested: performance.now(), started: undefined as number | undefined };
    clearTimeout(pass.timer);
    // An engine that swallows an utterance fires neither start nor end; without this the
    // voice would wait on it for the rest of the session and never speak.
    pass.timer = setTimeout(endPass, MEASURE_TIMEOUT_MS);
    speaker.speak({
      text: word.text,
      lang: voice.lang,
      rate: NEUTRAL_RATE,
      volume: 0,
      voice,
      onStart: () => {
        if (pass.id !== id) return;
        at.started = performance.now();
        learnLatency(voice.name, at.started - at.requested);
      },
      onEnd: () => {
        if (pass.id !== id) return;
        if (at.started !== undefined)
          samples.push({
            syllables: word.syllables,
            measuredMs: performance.now() - at.started,
            rate: NEUTRAL_RATE,
          });
        next(index + 1);
      },
    });
  };
  next(0);
};

/** Drops what was learned about every voice, and any pass in flight with it. */
export const forgetVoices = () => {
  endPass();
  forgetStored();
  // Dropped, not emptied: the next read comes back through storage, as a fresh load would.
  learned.value = undefined;
  voiceListeners.forEach((listener) => listener());
};

export const useVoices = (speaker: Speaker = browserSpeaker()): readonly VoiceInfo[] =>
  useSyncExternalStore(speaker.subscribe, speaker.voices, () => NO_VOICES);

const useSupported = (speaker: Speaker): boolean =>
  useSyncExternalStore(
    speaker.subscribe,
    () => speaker.supported,
    () => false,
  );

export type WarmupOptions = {
  readonly lang?: string;
  readonly gender?: Gender;
  readonly speaker?: Speaker;
};

/**
 * Measures the default voice as the app loads, so the first clip a learner plays is already
 * spoken. What a pass learns is the engine's, not a game's: one pass serves every screen,
 * every word and every speed.
 */
export const useVoiceWarmup = ({
  lang = 'es-ES',
  gender = 'mujer',
  speaker = browserSpeaker(),
}: WarmupOptions = {}) => {
  const available = useVoices(speaker);
  const known = useSyncExternalStore(subscribeKnowledge, knowledge, () => UNKNOWN);
  const voice = useMemo(() => pickVoice(available, { lang, gender }), [available, lang, gender]);
  const measured = voice !== undefined && known.paces[voice.name] !== undefined;

  useEffect(() => {
    if (voice === undefined || measured) return;
    measureVoice(speaker, voice);
    // Autoplay policy rejects an utterance with no user activation behind it, so the first
    // tap or key anywhere in the app retries what the load itself was not allowed to do.
    const retry = () => measureVoice(speaker, voice);
    window.addEventListener('pointerdown', retry);
    window.addEventListener('keydown', retry);
    return () => {
      window.removeEventListener('pointerdown', retry);
      window.removeEventListener('keydown', retry);
    };
  }, [voice, measured, speaker]);
};

/** Mount once, above the routes. Renders nothing; it only warms the voice up. */
export const VoiceWarmup = (): null => {
  useVoiceWarmup();
  return null;
};

export const useVoice = ({
  enabled = true,
  lang = 'es-ES',
  name,
  gender = 'mujer',
  volume = 1,
  onMeasure,
  speaker = browserSpeaker(),
}: VoiceOptions = {}): Voice => {
  const available = useVoices(speaker);
  const supported = useSupported(speaker);
  const selected = useMemo(
    () => pickVoice(available, { lang, name, gender }),
    [available, lang, name, gender],
  );
  const known = useSyncExternalStore(subscribeKnowledge, knowledge, () => UNKNOWN);
  const startedAt = useRef<number | undefined>(undefined);
  const requestedAt = useRef(0);

  const pace = selected === undefined ? undefined : known.paces[selected.name];
  const latencyMs = selected === undefined ? 0 : (known.latencies[selected.name] ?? 0);
  const active = enabled && supported && volume > 0 && selected !== undefined;

  const speak = useCallback(
    ({ text, syllables, targetMs }: Utterance): boolean => {
      if (!active || selected === undefined) return false;
      if (pace === undefined) {
        measureVoice(speaker, selected);
        return false;
      }
      const rate = rateFor({ syllables, targetMs, pace });
      requestedAt.current = performance.now();
      speaker.speak({
        text,
        lang: selected.lang,
        rate,
        volume,
        voice: selected,
        onStart: () => {
          const now = performance.now();
          startedAt.current = now;
          learnLatency(selected.name, now - requestedAt.current);
        },
        onEnd: () => {
          if (startedAt.current === undefined) return;
          const measuredMs = performance.now() - startedAt.current;
          startedAt.current = undefined;
          onMeasure?.({
            voice: selected.name,
            rate,
            targetMs,
            measuredMs,
            spokenMs: measuredMs - pace.overheadMs,
            driftMs: measuredMs - pace.overheadMs - targetMs,
            syllablesPerSecond: pace.syllablesPerSecond,
            overheadMs: pace.overheadMs,
            latencyMs,
          });
        },
      });
      return true;
    },
    [active, selected, pace, volume, latencyMs, speaker, onMeasure],
  );

  const cancel = useCallback(() => {
    startedAt.current = undefined;
    // A measuring pass is silent and holds the only channel there is. Cutting it to stop a
    // clip that is not being spoken would just cost the learner another silent one.
    if (pass.running) return;
    speaker.cancel();
  }, [speaker]);

  return {
    supported,
    available,
    selected,
    active,
    pace,
    measuring: known.measuring,
    latencyMs,
    speak,
    cancel,
    forget: forgetVoices,
  };
};
