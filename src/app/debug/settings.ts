import type { VoiceMeasurement } from '@/components/voice';
import { CROSSFADE_MS } from '@/lib/domain/crossfade';
import type { Gender, VoiceInfo } from '@/lib/application/speech';
import { INTER_WORD_MS } from '@/lib/domain/timing';
import { SETTINGS_PROMPT } from './prompts';

export type DebugSettings = {
  readonly text: string;
  readonly seseo: boolean;
  readonly face: boolean;
  readonly speed: number;
  readonly interWordMs: number;
  readonly exaggeration: number;
  readonly crossfadeMs: number;
  readonly voz: boolean;
  readonly gender: Gender;
  readonly voiceName?: string;
  readonly volume: number;
};

export const DEFAULT_SETTINGS: DebugSettings = {
  text: 'pala',
  seseo: false,
  face: true,
  speed: 1,
  interWordMs: INTER_WORD_MS,
  exaggeration: 1,
  crossfadeMs: CROSSFADE_MS,
  voz: true,
  gender: 'mujer',
  volume: 1,
};

export type Readout = {
  readonly voice?: VoiceInfo;
  readonly rate: number;
  readonly targetMs: number;
  readonly measurement?: VoiceMeasurement;
};

const voiceLine = (voice: VoiceInfo | undefined): string =>
  voice === undefined
    ? 'ninguna'
    : `${voice.name} · ${voice.lang} · ${voice.localService ? 'local' : 'red'}`;

const measuredLines = (targetMs: number, measurement: VoiceMeasurement | undefined): string => {
  const target = `objetivo: ${Math.round(targetMs)} ms`;
  if (measurement === undefined) return `${target}\nmedido: sin medir`;
  const drift = measurement.driftMs;
  return [
    target,
    `medido: ${Math.round(measurement.measuredMs)} ms (${Math.round(measurement.spokenMs)} hablando)`,
    `desfase: ${drift > 0 ? '+' : ''}${Math.round(drift)} ms`,
    `síl/s de la voz: ${measurement.syllablesPerSecond.toFixed(2)}`,
    `margen de la voz: ${Math.round(measurement.overheadMs)} ms`,
    `arranque de la voz: ${Math.round(measurement.latencyMs)} ms`,
  ].join('\n');
};

export const formatSettings = (settings: DebugSettings, readout: Readout): string =>
  [
    SETTINGS_PROMPT,
    '',
    `palabra: ${settings.text}`,
    `dialecto: ${settings.seseo ? 'seseo' : 'distinción'}`,
    `dibujo: ${settings.face ? 'cara' : 'solo boca'}`,
    `velocidad: x${settings.speed.toFixed(2)}`,
    `pausa entre palabras: ${settings.interWordMs} ms`,
    `exageración: x${settings.exaggeration.toFixed(2)}`,
    `transición: ${Math.round(settings.crossfadeMs)} ms`,
    '',
    `voz: ${settings.voz ? 'activada' : 'apagada'}`,
    `género preferido: ${settings.gender}`,
    `voz elegida: ${voiceLine(readout.voice)}`,
    `volumen: ${Math.round(settings.volume * 100)}%`,
    `rate: x${readout.rate.toFixed(2)}`,
    measuredLines(readout.targetMs, readout.measurement),
  ].join('\n');
