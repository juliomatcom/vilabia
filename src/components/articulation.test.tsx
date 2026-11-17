import { act, renderHook } from '@testing-library/react';
import { CALIBRATION_WORDS, MOUTH_LEAD_MS, type VoiceInfo } from '@/lib/application/speech';
import { useArticulation } from './articulation';
import { forgetVoices, type SpeakRequest, type Speaker } from './voice';

const MONICA: VoiceInfo = { name: 'Mónica', lang: 'es-ES', localService: true };
const VOICES: readonly VoiceInfo[] = [MONICA];

/** Like the engine: one utterance at a time, and cancel() ends whatever is speaking. */
const fakeSpeaker = () => {
  const spoken: SpeakRequest[] = [];
  const cancels = { count: 0 };
  const live = { request: undefined as SpeakRequest | undefined };
  const speaker: Speaker = {
    supported: true,
    voices: () => VOICES,
    subscribe: () => () => {},
    speak: (request) => {
      spoken.push(request);
      live.request = request;
    },
    cancel: () => {
      cancels.count += 1;
      const cut = live.request;
      live.request = undefined;
      cut?.onEnd();
    },
  };
  return { speaker, spoken, cancels, live, last: () => spoken[spoken.length - 1]! };
};

const FLO = { syllablesPerSecond: 6.12, overheadMs: 328 };

const syllablesOf = (text: string): number =>
  CALIBRATION_WORDS.find((word) => word.text === text)?.syllables ?? 2;

const reply = (request: SpeakRequest) => {
  act(() => request.onStart());
  act(() =>
    jest.advanceTimersByTime(
      FLO.overheadMs + (syllablesOf(request.text) / (FLO.syllablesPerSecond * request.rate)) * 1000,
    ),
  );
  act(() => request.onEnd());
};

type Hook = {
  current: { play: () => void; reset: () => void; wordSpans: readonly { startMs: number }[] };
};

/** A voice speaks nothing until it has measured itself; every test past that needs this. */
const afterMeasuring = (fake: ReturnType<typeof fakeSpeaker>, hook: Hook) => {
  act(() => hook.current.play());
  while (fake.spoken.length === 0) act(() => jest.advanceTimersByTime(50));
  CALIBRATION_WORDS.forEach(() => reply(fake.last()));
  act(() => hook.current.reset());
  fake.spoken.length = 0;
};

const voiced = (speaker: Speaker, text = 'pala', mouthLeadMs = 0) =>
  renderHook(() => useArticulation(text, { voice: { speaker }, mouthLeadMs }));

describe('useArticulation without a voice', () => {
  it('starts the clip at once, speaking nothing', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() => useArticulation('pala'));

    act(() => result.current.play());

    expect(result.current.playing).toBe(true);
    expect(result.current.position).toBe(0);
    expect(fake.spoken).toHaveLength(0);
  });
});

describe('useArticulation with a voice', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // What a voice reveals outlives the players that asked for it, so tests must reset it.
    localStorage.clear();
    forgetVoices();
  });
  afterEach(() => jest.useRealTimers());

  it('runs the timeline on its own clock, whatever the voice does', () => {
    const fake = fakeSpeaker();
    const { result } = voiced(fake.speaker);

    act(() => result.current.play());

    expect(result.current.playing).toBe(true);
    act(() => jest.advanceTimersByTime(200));
    expect(result.current.position).toBeGreaterThan(0);
  });

  it('plays the first clip of a new voice in silence while it measures it', () => {
    const fake = fakeSpeaker();
    const { result } = voiced(fake.speaker);

    act(() => result.current.play());
    act(() => jest.advanceTimersByTime(result.current.wordSpans[0]!.startMs + 1));

    expect(result.current.silenced).toBe(true);
    expect(result.current.playing).toBe(true);
    expect(fake.last().volume).toBe(0);
  });

  it('measures once for a clip of many words, not once per word', () => {
    const fake = fakeSpeaker();
    const { result } = voiced(fake.speaker, 'la pala roja');

    act(() => result.current.play());
    act(() => jest.advanceTimersByTime(result.current.totalMs));

    const first = CALIBRATION_WORDS[0]!.text;
    expect(fake.spoken.filter((request) => request.text === first)).toHaveLength(1);
  });

  it('costs a new voice one silent clip, not one per press', () => {
    const fake = fakeSpeaker();
    const { result } = voiced(fake.speaker);
    act(() => result.current.play());
    act(() => jest.advanceTimersByTime(result.current.wordSpans[0]!.startMs + 1));

    // The learner presses play again before the pass has finished.
    act(() => result.current.play());
    CALIBRATION_WORDS.forEach(() => reply(fake.last()));

    expect(result.current.voice.pace).toBeDefined();
    expect(result.current.silenced).toBe(false);
  });

  it('gives the same clip the same rate on every press', () => {
    const fake = fakeSpeaker();
    const { result } = voiced(fake.speaker);
    afterMeasuring(fake, result);

    const rates = [...Array(4)].map(() => {
      act(() => result.current.reset());
      act(() => result.current.play());
      act(() => jest.advanceTimersByTime(result.current.wordSpans[0]!.startMs + 10));
      const { rate } = fake.last();
      reply(fake.last());
      return rate;
    });

    expect(new Set(rates).size).toBe(1);
  });

  it('fires each word when the clock reaches it, minus what the engine takes to start', () => {
    const fake = fakeSpeaker();
    const { result } = voiced(fake.speaker, 'gato negro');
    afterMeasuring(fake, result);
    const spans = result.current.wordSpans;

    act(() => result.current.play());
    act(() => jest.advanceTimersByTime(spans[0]!.startMs));
    expect(fake.spoken).toHaveLength(1);
    expect(fake.last().text).toBe('gato');

    act(() => jest.advanceTimersByTime(spans[1]!.startMs - spans[0]!.startMs));
    expect(fake.spoken).toHaveLength(2);
    expect(fake.last().text).toBe('negro');
  });

  it('never lets the voice move the clock', () => {
    const fake = fakeSpeaker();
    const { result } = voiced(fake.speaker, 'gato negro');
    afterMeasuring(fake, result);

    act(() => result.current.play());
    act(() => jest.advanceTimersByTime(200));
    const before = result.current.position;
    act(() => fake.last().onStart());
    act(() => fake.last().onEnd());

    expect(result.current.position).toBe(before);
  });

  it('delays the sound behind the mouth by the lead', () => {
    const fake = fakeSpeaker();
    const lead = MOUTH_LEAD_MS + 200;
    const { result } = voiced(fake.speaker, 'pala', lead);
    afterMeasuring(fake, result);
    const heardAt = result.current.wordSpans[0]!.startMs + lead;

    act(() => result.current.play());
    act(() => jest.advanceTimersByTime(heardAt - 1));
    expect(fake.spoken).toHaveLength(0);

    act(() => jest.advanceTimersByTime(2));
    expect(fake.spoken).toHaveLength(1);
  });

  it('says nothing, and says so, once the clip is outside what the voice can stretch to', () => {
    const fake = fakeSpeaker();
    const { result } = renderHook(() =>
      useArticulation('pala', { voice: { speaker: fake.speaker }, speed: 0.5, mouthLeadMs: 0 }),
    );

    afterMeasuring(fake, result);
    const heard = fake.spoken.length;

    act(() => result.current.play());
    act(() => jest.advanceTimersByTime(result.current.totalMs / 2));

    expect(result.current.silenced).toBe(true);
    expect(result.current.playing).toBe(true);
    expect(fake.spoken).toHaveLength(heard);
  });

  it('leaves a silent player unmarked, since nothing was asked of the voice', () => {
    const { result } = renderHook(() => useArticulation('pala'));

    expect(result.current.silenced).toBe(false);
  });

  it('cancels the voice and its schedule on pause and on reset', () => {
    const fake = fakeSpeaker();
    const { result } = voiced(fake.speaker, 'gato negro');
    afterMeasuring(fake, result);

    act(() => result.current.play());
    act(() => result.current.pause());
    act(() => jest.advanceTimersByTime(5000));

    expect(fake.spoken).toHaveLength(0);
    expect(fake.cancels.count).toBeGreaterThan(0);
    expect(result.current.playing).toBe(false);
  });
});
