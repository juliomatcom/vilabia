import { SETTINGS_PROMPT } from './prompts';
import { DEFAULT_SETTINGS, formatSettings } from './settings';

const VOICE = { name: 'Mónica', lang: 'es-ES', localService: true };

describe('formatSettings', () => {
  it('opens with the instruction that says what to do with the values', () => {
    const text = formatSettings(DEFAULT_SETTINGS, { voice: VOICE, rate: 1, targetMs: 490 });

    expect(text.split('\n')[0]).toBe(SETTINGS_PROMPT);
  });

  it('carries the settings a person can actually change', () => {
    const text = formatSettings(DEFAULT_SETTINGS, { voice: VOICE, rate: 0.73, targetMs: 490 });

    expect(text).toContain('palabra: pala');
    expect(text).toContain('dialecto: distinción');
    expect(text).toContain('velocidad: x1.00');
    expect(text).toContain('exageración: x1.00');
    expect(text).toContain('género preferido: mujer');
    expect(text).toContain('voz elegida: Mónica · es-ES · local');
    expect(text).toContain('volumen: 100%');
    expect(text).toContain('rate: x0.73');
    expect(text).toContain('objetivo: 490 ms');
  });

  it('says so when nothing has been measured yet', () => {
    const text = formatSettings(DEFAULT_SETTINGS, { rate: 1, targetMs: 490 });

    expect(text).toContain('voz elegida: ninguna');
    expect(text).toContain('medido: sin medir');
  });

  it('reports what the voice measured, signing the drift', () => {
    const measurement = {
      voice: 'Mónica',
      rate: 0.73,
      targetMs: 490,
      measuredMs: 610,
      spokenMs: 610,
      driftMs: 120,
      syllablesPerSecond: 4.6,
      overheadMs: 328,
      latencyMs: 180,
    };
    const text = formatSettings(DEFAULT_SETTINGS, {
      voice: VOICE,
      rate: 0.73,
      targetMs: 490,
      measurement,
    });

    expect(text).toContain('medido: 610 ms (610 hablando)');
    expect(text).toContain('desfase: +120 ms');
    expect(text).toContain('síl/s de la voz: 4.60');
    expect(text).toContain('margen de la voz: 328 ms');
    expect(text).toContain('arranque de la voz: 180 ms');
  });
});
