import { DISTINCION, SESEO } from '@/lib/domain/g2p';
import {
  MAX_RATE,
  MIN_RATE,
  NEUTRAL_RATE,
  canFit,
  fitPace,
  genderOf,
  langFor,
  pickVoice,
  rateFor,
  spanishVoices,
  type VoiceInfo,
} from '.';

const voice = (name: string, lang: string, localService = true): VoiceInfo => ({
  name,
  lang,
  localService,
});

const MONICA = voice('Mónica', 'es-ES');
const JORGE = voice('Jorge', 'es-ES');
const PAULINA = voice('Paulina', 'es-MX');
const GOOGLE = voice('Google español', 'es-ES', false);
const SAMANTHA = voice('Samantha', 'en-US');

describe('langFor', () => {
  it('speaks peninsular Spanish by default', () => {
    expect(langFor(DISTINCION)).toBe('es-ES');
  });

  it('follows the dialect setting into Latin American Spanish', () => {
    expect(langFor(SESEO)).toBe('es-419');
  });
});

describe('pickVoice', () => {
  it('prefers the exact language over another Spanish variant', () => {
    expect(pickVoice([PAULINA, MONICA], { lang: 'es-ES' })).toBe(MONICA);
  });

  it('prefers a local voice over a network one at the same language', () => {
    expect(pickVoice([GOOGLE, MONICA], { lang: 'es-ES' })).toBe(MONICA);
  });

  it('falls back to any Spanish voice when the exact language is missing', () => {
    expect(pickVoice([SAMANTHA, PAULINA], { lang: 'es-ES' })).toBe(PAULINA);
  });

  it('never returns a voice outside Spanish', () => {
    expect(pickVoice([SAMANTHA], { lang: 'es-ES' })).toBeUndefined();
  });

  it('honours an explicit name over the ranking', () => {
    expect(pickVoice([MONICA, PAULINA], { lang: 'es-ES', name: 'Paulina' })).toBe(PAULINA);
  });

  it('ignores case and underscores in language tags', () => {
    expect(pickVoice([voice('X', 'es_es')], { lang: 'es-ES' })?.name).toBe('X');
  });
});

describe('genderOf', () => {
  it('reads the given name out of a platform voice label', () => {
    expect(genderOf(MONICA)).toBe('mujer');
    expect(genderOf(JORGE)).toBe('hombre');
    expect(genderOf(voice('Microsoft Helena - Spanish (Spain)', 'es-ES'))).toBe('mujer');
    expect(genderOf(voice('Microsoft Pablo - Spanish (Spain)', 'es-ES'))).toBe('hombre');
    expect(genderOf(voice('Flo (Spanish (Spain))', 'es-ES'))).toBe('mujer');
  });

  it('ignores accents and casing', () => {
    expect(genderOf(voice('MÓNICA', 'es-ES'))).toBe('mujer');
  });

  it('admits it does not know an unlisted voice', () => {
    expect(genderOf(voice('Google español', 'es-ES'))).toBeUndefined();
  });
});

describe('pickVoice by gender', () => {
  it('prefers the requested gender at the same language', () => {
    expect(pickVoice([JORGE, MONICA], { lang: 'es-ES', gender: 'mujer' })).toBe(MONICA);
    expect(pickVoice([MONICA, JORGE], { lang: 'es-ES', gender: 'hombre' })).toBe(JORGE);
  });

  it('takes gender over a local voice', () => {
    expect(
      pickVoice([JORGE, voice('Elvira', 'es-ES', false)], { lang: 'es-ES', gender: 'mujer' })?.name,
    ).toBe('Elvira');
  });

  it('never takes gender over the language the visemes were built for', () => {
    expect(pickVoice([JORGE, PAULINA], { lang: 'es-ES', gender: 'mujer' })).toBe(JORGE);
  });

  it('falls back to the plain ranking when no voice matches the gender', () => {
    expect(pickVoice([JORGE], { lang: 'es-ES', gender: 'mujer' })).toBe(JORGE);
  });
});

describe('spanishVoices', () => {
  it('keeps every Spanish variant and drops the rest', () => {
    expect(spanishVoices([MONICA, SAMANTHA, PAULINA])).toEqual([MONICA, PAULINA]);
  });
});

describe('rateFor', () => {
  const pace = { syllablesPerSecond: 5.6, overheadMs: 0 };

  it('leaves a voice it has never measured at its own natural rate', () => {
    expect(rateFor({ syllables: 2, targetMs: 490 })).toBe(NEUTRAL_RATE);
  });

  it('slows a measured voice down to fill a clip longer than its natural speech', () => {
    expect(rateFor({ syllables: 2, targetMs: 490, pace })).toBeCloseTo(2 / 0.49 / 5.6, 5);
  });

  it('is neutral when the voice already matches the clip', () => {
    expect(rateFor({ syllables: 2, targetMs: (2 / 5.6) * 1000, pace })).toBeCloseTo(
      NEUTRAL_RATE,
      5,
    );
  });

  it('clamps a clip too short to speak', () => {
    expect(rateFor({ syllables: 8, targetMs: 200, pace })).toBe(MAX_RATE);
  });

  it('clamps a clip too long to stretch into', () => {
    expect(rateFor({ syllables: 1, targetMs: 10000, pace })).toBe(MIN_RATE);
  });

  it('falls back to neutral on degenerate input', () => {
    expect(rateFor({ syllables: 0, targetMs: 500, pace })).toBe(NEUTRAL_RATE);
    expect(rateFor({ syllables: 2, targetMs: 0, pace })).toBe(NEUTRAL_RATE);
  });
});

describe('canFit', () => {
  const pace = { syllablesPerSecond: 6.12, overheadMs: 328 };

  it('accepts a span the voice can reach by slowing down or hurrying', () => {
    expect(canFit({ syllables: 2, targetMs: 490, pace })).toBe(true);
  });

  it('refuses a span too long for the voice to stretch into', () => {
    expect(canFit({ syllables: 2, targetMs: 980, pace })).toBe(false);
  });

  it('refuses a span too short for the voice to hurry into', () => {
    expect(canFit({ syllables: 8, targetMs: 300, pace })).toBe(false);
  });

  it('gives an unmeasured voice the benefit of the doubt, since it must speak to be measured', () => {
    expect(canFit({ syllables: 2, targetMs: 980 })).toBe(true);
  });
});

describe('fitPace', () => {
  const fallback = { syllablesPerSecond: 5.6, overheadMs: 0 };
  const at = (pace: number, overheadMs: number, syllables: number, rate: number) => ({
    syllables,
    rate,
    measuredMs: overheadMs + (syllables / (pace * rate)) * 1000,
  });

  it('separates the voice pace from the silence around it', () => {
    const samples = [at(6.12, 328, 8, 0.7), at(6.12, 328, 8, 0.97)];
    const fitted = fitPace(samples, fallback);

    expect(fitted?.syllablesPerSecond).toBeCloseTo(6.12, 2);
    expect(fitted?.overheadMs).toBeCloseTo(328, 0);
  });

  it('separates them from words of different lengths at one rate', () => {
    const samples = [at(6.12, 328, 2, 1), at(6.12, 328, 8, 1)];
    const fitted = fitPace(samples, fallback);

    expect(fitted?.syllablesPerSecond).toBeCloseTo(6.12, 2);
    expect(fitted?.overheadMs).toBeCloseTo(328, 0);
  });

  it('is the only estimator left, so it must refuse rather than guess', () => {
    expect(fitPace([], fallback)).toBe(fallback);
    expect(fitPace([at(6.12, 328, 8, 0.7)], fallback)).toBe(fallback);
    expect(fitPace([at(6.12, 328, 4, 1), at(6.12, 328, 4, 1)], fallback)).toBe(fallback);
  });

  it('refuses to draw a line through samples that barely differ', () => {
    const clustered = [at(6.12, 328, 8, 0.9), at(6.12, 328, 8, 0.92)];
    expect(fitPace(clustered, fallback)).toBe(fallback);
  });

  it('refuses a fit that no voice could produce', () => {
    const nonsense = [
      { syllables: 2, rate: 1, measuredMs: 1000 },
      { syllables: 8, rate: 1, measuredMs: 1010 },
    ];
    expect(fitPace(nonsense, fallback)).toBe(fallback);
  });

  it('ignores samples that never really played', () => {
    const samples = [
      at(6.12, 328, 2, 1),
      at(6.12, 328, 8, 1),
      { syllables: 0, rate: 1, measuredMs: 0 },
    ];
    expect(fitPace(samples, fallback)?.syllablesPerSecond).toBeCloseTo(6.12, 2);
  });
});
