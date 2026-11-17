import { act, renderHook } from '@testing-library/react';
import {
  CALIBRATION_WORDS,
  MEASURE_TIMEOUT_MS,
  rateFor,
  type VoiceInfo,
} from '@/lib/application/speech';
import {
  SILENT_SPEAKER,
  forgetVoices,
  setMuted,
  useMuted,
  useVoice,
  useVoiceWarmup,
  type SpeakRequest,
  type Speaker,
} from './voice';

const MONICA: VoiceInfo = { name: 'Mónica', lang: 'es-ES', localService: true };
const SAMANTHA: VoiceInfo = { name: 'Samantha', lang: 'en-US', localService: true };
const SPANISH: readonly VoiceInfo[] = [MONICA];
const ENGLISH: readonly VoiceInfo[] = [SAMANTHA];

const FLO = { syllablesPerSecond: 6.12, overheadMs: 328 };
const PACE_KEY = 'vilabia.voice.pace';
const PALA = { text: 'pala', syllables: 2, targetMs: 490 };

/** Like the engine: one utterance at a time, and cancel() ends whatever is speaking. */
const fakeSpeaker = (voices = SPANISH) => {
  const spoken: SpeakRequest[] = [];
  const cancels = { count: 0 };
  const live = { request: undefined as SpeakRequest | undefined };
  const refuse = { until: 0 };
  const speaker: Speaker = {
    supported: true,
    voices: () => voices,
    subscribe: () => () => {},
    speak: (request) => {
      spoken.push(request);
      // Refused for want of a user gesture: an error, so `onEnd` with no `onStart`.
      if (spoken.length <= refuse.until) {
        request.onEnd();
        return;
      }
      live.request = request;
    },
    cancel: () => {
      cancels.count += 1;
      const cut = live.request;
      live.request = undefined;
      cut?.onEnd();
    },
  };
  return { speaker, spoken, cancels, live, refuse, last: () => spoken[spoken.length - 1]! };
};

const syllablesOf = (text: string): number =>
  CALIBRATION_WORDS.find((word) => word.text === text)?.syllables ?? PALA.syllables;

/** Answers the pending utterance as a real voice of this pace and overhead would. */
const reply = (request: SpeakRequest) => {
  act(() => request.onStart());
  act(() =>
    jest.advanceTimersByTime(
      FLO.overheadMs + (syllablesOf(request.text) / (FLO.syllablesPerSecond * request.rate)) * 1000,
    ),
  );
  act(() => request.onEnd());
};

const measured = (fake: ReturnType<typeof fakeSpeaker>, speak: () => boolean) => {
  act(() => {
    speak();
  });
  CALIBRATION_WORDS.forEach(() => reply(fake.last()));
};

const countOf = (fake: ReturnType<typeof fakeSpeaker>, text: string): number =>
  fake.spoken.filter((request) => request.text === text).length;

/** What a voice reveals outlives the players that asked for it, so tests must reset it. */
const freshApp = () => {
  localStorage.clear();
  forgetVoices();
};

describe('useVoice', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    freshApp();
  });
  afterEach(() => jest.useRealTimers());

  it('says nothing the first time a voice is used, and measures it in silence instead', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));

    let spoke = true;
    act(() => {
      spoke = result.current.speak(PALA);
    });

    expect(spoke).toBe(false);
    expect(fake.spoken).toHaveLength(1);
    expect(fake.last().volume).toBe(0);
    expect(fake.last().text).toBe(CALIBRATION_WORDS[0]!.text);
    expect(result.current.measuring).toBe(true);
  });

  it('measures on two words of different lengths, then knows the voice', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));

    measured(fake, () => result.current.speak(PALA));

    expect(fake.spoken.map((request) => request.text)).toEqual(
      CALIBRATION_WORDS.map((word) => word.text),
    );
    expect(result.current.measuring).toBe(false);
    expect(result.current.pace?.syllablesPerSecond).toBeCloseTo(FLO.syllablesPerSecond, 1);
    expect(result.current.pace?.overheadMs).toBeCloseTo(FLO.overheadMs, 0);
  });

  it('speaks the clip at the rate its own measurement asks for', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker, volume: 0.4 }));

    measured(fake, () => result.current.speak(PALA));
    let spoke = false;
    act(() => {
      spoke = result.current.speak(PALA);
    });
    expect(spoke).toBe(true);

    expect(fake.last().text).toBe('pala');
    expect(fake.last().volume).toBe(0.4);
    expect(fake.last().rate).toBeCloseTo(rateFor({ ...PALA, pace: result.current.pace }), 5);
  });

  it('gives the same clip the same rate however many times it is played', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));

    measured(fake, () => result.current.speak(PALA));
    const rates = [...Array(5)].map(() => {
      act(() => {
        result.current.speak(PALA);
      });
      const { rate } = fake.last();
      reply(fake.last());
      return rate;
    });

    expect(new Set(rates).size).toBe(1);
  });

  it('measures a voice once and never again, even across mounts', () => {
    const fake = fakeSpeaker();
    const first = renderHook(() => useVoice({ speaker: fake.speaker }));
    measured(fake, () => first.result.current.speak(PALA));
    const passes = fake.spoken.length;

    const second = renderHook(() => useVoice({ speaker: fake.speaker }));
    act(() => {
      second.result.current.speak(PALA);
    });

    expect(fake.spoken).toHaveLength(passes + 1);
    expect(fake.last().volume).toBe(1);
  });

  it('stays silent when disabled, when muted, and with no Spanish voice', () => {
    const fake = fakeSpeaker();
    const off = renderHook(() => useVoice({ enabled: false, speaker: fake.speaker }));
    const muted = renderHook(() => useVoice({ volume: 0, speaker: fake.speaker }));
    const foreign = renderHook(() => useVoice({ speaker: fakeSpeaker(ENGLISH).speaker }));

    expect(off.result.current.speak(PALA)).toBe(false);
    expect(muted.result.current.speak(PALA)).toBe(false);
    expect(foreign.result.current.speak(PALA)).toBe(false);
    expect(fake.spoken).toHaveLength(0);
  });

  it('reports no support instead of throwing where the API is absent', () => {
    const { result } = renderHook(() => useVoice({ speaker: SILENT_SPEAKER }));

    expect(result.current.supported).toBe(false);
    expect(result.current.speak(PALA)).toBe(false);
  });

  it('learns what the engine takes to start speaking', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));

    act(() => {
      result.current.speak(PALA);
    });
    act(() => jest.advanceTimersByTime(200));
    act(() => fake.last().onStart());

    expect(result.current.latencyMs).toBe(200);
  });

  it('measures once however many times a clip asks for a voice it does not know', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));

    act(() => {
      result.current.speak(PALA);
      result.current.speak(PALA);
      result.current.speak(PALA);
    });

    expect(countOf(fake, CALIBRATION_WORDS[0]!.text)).toBe(1);
  });

  it('measures through a cancel, which has no sound of its own to cut', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));
    act(() => {
      result.current.speak(PALA);
    });

    act(() => result.current.cancel());
    CALIBRATION_WORDS.forEach(() => reply(fake.last()));

    expect(result.current.measuring).toBe(false);
    expect(result.current.pace?.syllablesPerSecond).toBeCloseTo(FLO.syllablesPerSecond, 1);
  });

  it('gives up on a voice that never answers, instead of measuring for ever', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));
    act(() => {
      result.current.speak(PALA);
    });
    expect(result.current.measuring).toBe(true);

    act(() => jest.advanceTimersByTime(MEASURE_TIMEOUT_MS));

    expect(result.current.measuring).toBe(false);
    act(() => {
      result.current.speak(PALA);
    });
    expect(countOf(fake, CALIBRATION_WORDS[0]!.text)).toBe(2);
  });

  it('cancels through to the speaker', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));

    result.current.cancel();

    expect(fake.cancels.count).toBe(1);
  });

  it('keeps what it measured for the next session', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));
    measured(fake, () => result.current.speak(PALA));

    const stored = JSON.parse(localStorage.getItem(PACE_KEY) ?? '{}');

    expect(stored[MONICA.name].syllablesPerSecond).toBeCloseTo(FLO.syllablesPerSecond, 1);
  });

  it('knows a voice another player measured, without measuring it again', () => {
    const fake = fakeSpeaker();
    const first = renderHook(() => useVoice({ speaker: fake.speaker }));
    measured(fake, () => first.result.current.speak(PALA));

    const second = renderHook(() => useVoice({ speaker: fake.speaker }));

    expect(second.result.current.pace?.syllablesPerSecond).toBeCloseTo(FLO.syllablesPerSecond, 1);
    expect(countOf(fake, CALIBRATION_WORDS[0]!.text)).toBe(1);
  });

  it('forgets a voice on request, since samples belong to one voice', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));
    measured(fake, () => result.current.speak(PALA));

    act(() => result.current.forget());

    expect(result.current.pace).toBeUndefined();
  });
});

describe('useVoiceWarmup', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    freshApp();
  });
  afterEach(() => jest.useRealTimers());

  it('measures the voice as the app loads, before any clip is played', () => {
    const fake = fakeSpeaker();

    renderHook(() => useVoiceWarmup({ speaker: fake.speaker }));
    CALIBRATION_WORDS.forEach(() => reply(fake.last()));

    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));
    expect(result.current.pace?.syllablesPerSecond).toBeCloseTo(FLO.syllablesPerSecond, 1);
    expect(result.current.measuring).toBe(false);
  });

  it('speaks the very first clip a player asks for', () => {
    const fake = fakeSpeaker();
    renderHook(() => useVoiceWarmup({ speaker: fake.speaker }));
    CALIBRATION_WORDS.forEach(() => reply(fake.last()));
    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));

    let spoke = false;
    act(() => {
      spoke = result.current.speak(PALA);
    });

    expect(spoke).toBe(true);
    expect(fake.last().volume).toBe(1);
  });

  it('retries on the first gesture, for an engine that needs one', () => {
    const fake = fakeSpeaker();
    // Autoplay policy: with no gesture behind it, every utterance is refused outright.
    fake.refuse.until = CALIBRATION_WORDS.length;

    renderHook(() => useVoiceWarmup({ speaker: fake.speaker }));
    expect(fake.spoken).toHaveLength(CALIBRATION_WORDS.length);

    act(() => {
      window.dispatchEvent(new Event('pointerdown'));
    });
    CALIBRATION_WORDS.forEach(() => reply(fake.last()));

    const { result } = renderHook(() => useVoice({ speaker: fake.speaker }));
    expect(result.current.pace?.syllablesPerSecond).toBeCloseTo(FLO.syllablesPerSecond, 1);
  });

  it('leaves a voice it already knows alone', () => {
    const fake = fakeSpeaker();
    const first = renderHook(() => useVoice({ speaker: fake.speaker }));
    measured(fake, () => first.result.current.speak(PALA));

    renderHook(() => useVoiceWarmup({ speaker: fake.speaker }));

    expect(countOf(fake, CALIBRATION_WORDS[0]!.text)).toBe(1);
  });

  it('warms nothing up where there is no Spanish voice', () => {
    const fake = fakeSpeaker(ENGLISH);

    renderHook(() => useVoiceWarmup({ speaker: fake.speaker }));

    expect(fake.spoken).toHaveLength(0);
  });
});

describe('a page load', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    freshApp();
  });
  afterEach(() => jest.useRealTimers());

  /** A reload keeps the device's storage and loses everything the module held. */
  const reload = () => {
    const stored = localStorage.getItem(PACE_KEY);
    forgetVoices();
    if (stored !== null) localStorage.setItem(PACE_KEY, stored);
  };

  it('reads back the voice measured before a reload, and measures nothing again', () => {
    const before = fakeSpeaker();
    const session = renderHook(() => useVoiceWarmup({ speaker: before.speaker }));
    CALIBRATION_WORDS.forEach(() => reply(before.last()));

    session.unmount();
    reload();

    const after = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: after.speaker }));
    renderHook(() => useVoiceWarmup({ speaker: after.speaker }));
    expect(result.current.pace?.syllablesPerSecond).toBeCloseTo(FLO.syllablesPerSecond, 1);
    expect(after.spoken).toHaveLength(0);
  });

  it('speaks the first clip after a reload, with no gesture in between', () => {
    const before = fakeSpeaker();
    const session = renderHook(() => useVoiceWarmup({ speaker: before.speaker }));
    CALIBRATION_WORDS.forEach(() => reply(before.last()));

    session.unmount();
    reload();

    const after = fakeSpeaker();
    const { result } = renderHook(() => useVoice({ speaker: after.speaker }));
    let spoke = false;
    act(() => {
      spoke = result.current.speak(PALA);
    });

    expect(spoke).toBe(true);
    expect(after.last().volume).toBe(1);
  });
});

describe('useMuted', () => {
  beforeEach(() => setMuted(false));

  it('starts unmuted', () => {
    const { result } = renderHook(() => useMuted());

    expect(result.current[0]).toBe(false);
  });

  it('shares one value across every reader', () => {
    const a = renderHook(() => useMuted());
    const b = renderHook(() => useMuted());

    act(() => a.result.current[1](true));

    expect(a.result.current[0]).toBe(true);
    expect(b.result.current[0]).toBe(true);
  });

  it('keeps nothing for the next session, so every load starts with sound', () => {
    const { result } = renderHook(() => useMuted());

    act(() => result.current[1](true));

    expect(Object.keys(localStorage)).not.toContain('vilabia.voice.muted');
  });
});
