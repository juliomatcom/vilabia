import { SHAPES } from '@/lib/domain/mouth';
import { articulate, frameAt, voiceCues, voiceFits } from './index';

describe('articulate', () => {
  it('turns text into a framed, timed clip', () => {
    const clip = articulate('pala');
    expect(clip.words.map((word) => word.text)).toEqual(['pala']);
    expect(clip.timeline.map((entry) => entry.phoneme ?? 'REST')).toEqual([
      'REST',
      'p',
      'a',
      'l',
      'a',
      'REST',
    ]);
    expect(clip.totalMs).toBe(clip.timeline[clip.timeline.length - 1]!.endMs);
  });

  it('halves every duration at double speed', () => {
    expect(articulate('pala', { speed: 2 }).totalMs).toBeCloseTo(
      articulate('pala').totalMs / 2,
      -1,
    );
  });
});

describe('frameAt', () => {
  const clip = articulate('pala');
  const p = clip.timeline[1]!;

  it('shows the sound held in the middle of its block', () => {
    const frame = frameAt(clip, (p.startMs + p.endMs) / 2);
    expect(frame.sound).toBe('p');
    expect(frame.viseme).toBe('BILABIAL');
    expect(frame.shape).toEqual(SHAPES.p);
  });
});

describe('voice', () => {
  const clip = articulate('gato negro');

  it('fits any clip while the voice is unmeasured', () => {
    expect(voiceFits(clip, undefined)).toBe(true);
  });

  it('cues each word ahead of its span by the engine latency, after the mouth lead', () => {
    const plan = voiceCues(clip, { fromMs: 0, mouthLeadMs: 40, latencyMs: 100 });
    expect(plan.cues.map((cue) => cue.text)).toEqual(['gato', 'negro']);
    expect(plan.cues[1]!.atMs).toBe(clip.wordSpans[1]!.startMs + 40 - 100 + plan.delayMs);
  });

  it('delays the clock only when the first word cannot launch early enough', () => {
    expect(voiceCues(clip, { fromMs: 0, mouthLeadMs: 0, latencyMs: 0 }).delayMs).toBe(0);
    const late = voiceCues(clip, { fromMs: 0, mouthLeadMs: 0, latencyMs: 400 });
    expect(late.delayMs).toBeGreaterThan(0);
    expect(late.cues[0]!.atMs).toBe(0);
  });

  it('skips words already heard when resuming mid-clip', () => {
    const resumed = voiceCues(clip, {
      fromMs: clip.wordSpans[1]!.startMs - 1,
      mouthLeadMs: 0,
      latencyMs: 0,
    });
    expect(resumed.cues.map((cue) => cue.text)).toEqual(['negro']);
  });
});
