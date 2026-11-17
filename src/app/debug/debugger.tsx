'use client';

import { useCallback, useState } from 'react';
import { useArticulation } from '@/components/articulation';
import { useVoices, type VoiceMeasurement } from '@/components/voice';
import { PauseIcon, PlayIcon } from '@/components/icons';
import { Player } from '@/components/player';
import { Face } from '@/components/face';
import { ParametricMouth } from '@/components/parametric-mouth';
import { DISTINCION, SESEO, toIpa } from '@/lib/domain/g2p';
import {
  DRIFT_TOLERANCE_MS,
  genderOf,
  langFor,
  spanishVoices,
  type Gender,
} from '@/lib/application/speech';
import { CopyButton } from './copy-button';
import { DEFAULT_SETTINGS, formatSettings, type DebugSettings } from './settings';
import { SHAPES, type ShapeKey, type ShapeTable, type Sound } from '@/lib/domain/mouth';
import { layersAt } from '@/lib/domain/crossfade';
import { Alphabet } from './alphabet';
import { soundLabel } from '@/components/alphabet-chart';
import { Tuner } from './tuner';
import { NotationKey, Rich } from './rich-text';
import { Stage } from './stage';

const PRESETS: readonly {
  readonly words: readonly string[];
  readonly title: string;
  readonly hint: string;
}[] = [
  {
    words: ['pala', 'bala', 'mala'],
    title: 'Mismo visema, tres posturas',
    hint: 'Los sonidos /p/, /b/ y /m/ juntan los labios. Comparten visema, pero cada uno tiene su postura: /p/ aprieta con aire, /b/ deja un pequeño hueco con aire, /m/ los junta relajados.',
  },
  {
    words: ['tala'],
    title: 'La que se sale',
    hint: 'La /t/ se articula con la lengua detrás de los dientes, así que la primera forma es distinta de las tres anteriores. La opción fácil dentro de una ronda difícil.',
  },
  {
    words: ['casa', 'caza'],
    title: 'La lengua la delata',
    hint: 'En España la letra ⟨z⟩ se pronuncia /θ/, con la lengua entre los dientes, así que se ve. Activa el seseo y pasa a pronunciarse /s/: las dos palabras se vuelven idénticas, como en América Latina.',
  },
  {
    words: ['pero', 'perro'],
    title: 'Mismas formas, distinta duración',
    hint: 'Vibrante simple /ɾ/ frente a vibrante múltiple /r/. Las posiciones de la boca coinciden y solo cambia la duración: fíjate en el ancho de los bloques, no en las formas.',
  },
  {
    words: ['chico', 'llave', 'pingüino', 'gato negro'],
    title: 'El resto',
    hint: 'Ortografía que no coincide con la pronunciación: ⟨ch⟩ es un solo sonido /tʃ/, ⟨ll⟩ es un solo sonido /ʝ/, la ⟨u⟩ de pingüino se oye y la de guerra no.',
  },
];

export const Debugger = () => {
  const [settings, setSettings] = useState<DebugSettings>(DEFAULT_SETTINGS);
  const [shapes, setShapes] = useState<ShapeTable>(SHAPES);
  const [tuned, setTuned] = useState<Sound>('p');
  const [held, setHeld] = useState<Sound | undefined>(undefined);
  const [measurement, setMeasurement] = useState<VoiceMeasurement | undefined>(undefined);

  const set = <K extends keyof DebugSettings>(key: K, value: DebugSettings[K]) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const tuneShape = useCallback(
    (sound: Sound, key: ShapeKey, value: number) =>
      setShapes((current) => ({ ...current, [sound]: { ...current[sound], [key]: value } })),
    [],
  );
  const resetShapes = useCallback(() => setShapes(SHAPES), []);
  const selectTuned = useCallback((next: Sound) => {
    setTuned(next);
    setHeld(next);
  }, []);

  const {
    text,
    seseo,
    face,
    speed,
    interWordMs,
    exaggeration,
    crossfadeMs: crossfade,
    voz,
    gender,
    voiceName,
    volume,
  } = settings;

  const dialect = seseo ? SESEO : DISTINCION;
  const available = spanishVoices(useVoices());

  const {
    words,
    segments,
    timeline,
    totalMs,
    position,
    shape,
    sound,
    label,
    playing,
    play: playArticulation,
    pause: pausePlayback,
    seekTo,
    reset,
    speech,
    spokenMs,
    voice,
    silenced,
  } = useArticulation(text, {
    dialect,
    speed,
    interWordMs,
    crossfadeMs: crossfade,
    exaggeration,
    shapes,
    voice: voz ? { name: voiceName, gender, volume, onMeasure: setMeasurement } : undefined,
  });
  const ipa = toIpa(words);
  const layers = layersAt(timeline, position, { crossfadeMs: crossfade / speed });
  const drift = measurement?.driftMs ?? 0;

  const copy = () =>
    formatSettings(settings, {
      voice: voice.selected,
      rate: measurement?.rate ?? 1,
      targetMs: spokenMs,
      measurement,
    });

  const play = () => {
    setHeld(undefined);
    playArticulation();
  };

  const load = (next: string) => {
    set('text', next);
    setHeld(undefined);
    reset();
  };

  const seek = (ms: number) => {
    setHeld(undefined);
    seekTo(ms);
  };

  const shown = held === undefined ? shape : shapes[held];
  const shownLabel =
    held === undefined ? `${soundLabel(sound)} · ${label}` : `${soundLabel(held)} · quieta`;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Debugger visemas</h1>
        <NotationKey />
        <p className="max-w-3xl text-sm opacity-80">
          Escribe una palabra y pulsa Enter para reproducirla. Esta es la herramienta de pruebas de
          la librería: cada panel de abajo es un módulo del proceso y muestra lo que ese módulo ha
          producido para la palabra escrita, indicando el archivo del que sale.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="flex flex-col items-center gap-3">
          <Player
            playing={playing}
            onToggle={playing ? pausePlayback : play}
            silenced={silenced}
            silencedLabel={
              voice.selected === undefined
                ? 'Sin voz en español en este navegador'
                : voice.measuring || voice.pace === undefined
                  ? 'Midiendo la voz: esta vez suena en silencio'
                  : 'Sin voz: a esta velocidad el sintetizador no puede seguir a los labios'
            }
          >
            {face ? (
              <Face
                shape={shown}
                alive
                speaking={playing}
                label={shownLabel}
                className="mx-auto w-full max-w-sm"
              />
            ) : (
              <ParametricMouth
                shape={shown}
                label={shownLabel}
                className="mx-auto w-full max-w-md"
              />
            )}
          </Player>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={playing ? pausePlayback : play}
              className="rounded-md border border-zinc-300 bg-white px-5 py-2 font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              <span className="flex items-center gap-2">
                {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                {playing ? 'Pausa' : 'Hablar'}
              </span>
            </button>
            <span className="font-mono opacity-70">
              {Math.round(position)} / {totalMs} ms
            </span>
          </div>

          <div className="flex h-12 w-full overflow-hidden rounded border border-current/20">
            {timeline.map((entry) => {
              const active = position >= entry.startMs && position < entry.endMs;
              return (
                <button
                  key={entry.startMs}
                  type="button"
                  onClick={() => seek((entry.startMs + entry.endMs) / 2)}
                  style={{ width: `${((entry.endMs - entry.startMs) / totalMs) * 100}%` }}
                  className={`flex items-center justify-center overflow-hidden border-r border-current/20 text-[10px] hover:bg-current/20 ${
                    active ? 'bg-current/30 font-semibold' : 'bg-current/5'
                  }`}
                  title={`${entry.viseme} ${soundLabel(entry.phoneme ?? 'REST')} ${entry.startMs}–${entry.endMs} ms`}
                >
                  <span className="flex flex-col items-center leading-tight">
                    <span className="font-mono text-xs">{soundLabel(entry.phoneme ?? 'REST')}</span>
                    <span>{entry.viseme}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs opacity-60">
            El ancho de cada bloque es el tiempo que se mantiene la forma: los bloques anchos son
            sonidos lentos y los estrechos, rápidos. Pulsa un bloque para saltar a esa postura y
            verla quieta.
          </p>

          <div className="mt-3 grid w-full gap-4">
            <Stage
              index={1}
              title="Sonidos"
              module="src/lib/g2p"
              fn="toPhonemes(text, dialect)"
              page="wiki-llm/g2p.md"
              blurb="La ortografía se convierte en los sonidos que de verdad se pronuncian: la ⟨h⟩ no suena, ⟨qu⟩ es un solo sonido /k/, ⟨rr⟩ es un solo sonido /r/. El signo ˈ va delante de la sílaba tónica y los puntos separan sílabas. El dialecto se aplica aquí: es la única etapa que cambia con el seseo."
            >
              <p className="font-mono text-lg">/{ipa}/</p>
              <div className="flex flex-wrap gap-2">
                {words.flatMap((word) =>
                  word.syllables.map((syllable, index) => (
                    <span
                      key={`${word.text}-${index}`}
                      className={`rounded px-2 py-1 font-mono text-sm ${
                        syllable.stressed ? 'bg-current/20 font-semibold' : 'bg-current/5'
                      }`}
                      title={syllable.stressed ? 'sílaba tónica' : 'sílaba átona'}
                    >
                      {syllable.phonemes.join('')}
                    </span>
                  )),
                )}
              </div>
            </Stage>

            <Stage
              index={2}
              title="Formas de la boca"
              module="src/lib/viseme"
              fn="toVisemes(words)"
              page="wiki-llm/visemes.md"
              blurb="Cada sonido pertenece a uno de los catorce visemas y tiene, dentro de él, su propia forma de boca. Los sonidos de un visema se parecen mucho — /p/, /b/ y /m/ juntan los labios — y esa coincidencia es lo que hace difícil la lectura labial y lo que el juego pone a prueba. Aquí todavía no interviene el tiempo."
            >
              <ul aria-label="Sonido a forma" className="flex flex-wrap gap-2">
                {segments.map((segment, index) => (
                  <li
                    key={`${segment.phoneme}-${index}`}
                    className="flex items-center gap-2 rounded border border-current/15 px-2 py-1 text-xs"
                  >
                    <span className="font-mono text-sm italic">/{segment.phoneme}/</span>
                    <span className="opacity-40">→</span>
                    <span className="font-mono opacity-80">{segment.viseme}</span>
                  </li>
                ))}
              </ul>
            </Stage>

            <Stage
              index={3}
              title="Tiempos"
              module="src/lib/timing"
              fn="toTimeline(segments, { speed })"
              page="wiki-llm/timing.md"
              blurb="Cada postura recibe una duración en milisegundos. La transición solapa cada postura con la siguiente y se escala con la velocidad, igual que las duraciones. Las sílabas tónicas se mantienen más tiempo, un sonido repetido se mantiene una sola vez y el reposo enmarca la palabra por delante y por detrás."
            >
              <ol className="grid grid-cols-2 gap-x-6 font-mono text-xs">
                {timeline.map((entry) => (
                  <li key={entry.startMs} className="flex justify-between gap-2">
                    <span>
                      {soundLabel(entry.phoneme ?? 'REST')} {entry.viseme}
                    </span>
                    <span className="opacity-60">
                      {entry.startMs}–{entry.endMs}
                    </span>
                  </li>
                ))}
              </ol>
            </Stage>
          </div>
        </section>

        <aside className="flex flex-col gap-4 rounded border border-current/15 p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-sm font-semibold">Ajustes</h2>
            <CopyButton
              label="Copiar ajustes"
              title="Copiar todos los ajustes al portapapeles"
              text={copy}
            />
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span>Palabra</span>
            <input
              value={text}
              onChange={(event) => load(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') play();
              }}
              className="rounded border border-current/20 px-3 py-2 text-lg"
            />
          </label>

          <div className="flex flex-col gap-3 text-sm">
            <label
              className="flex items-center gap-2"
              title="Dibujar la cara entera o solo la boca"
            >
              <input
                type="checkbox"
                checked={face}
                onChange={(event) => set('face', event.target.checked)}
              />
              cara
            </label>
            <label
              className="flex items-center gap-2"
              title="Pronunciación de América Latina: la z y la c suave suenan como s"
            >
              <input
                type="checkbox"
                checked={seseo}
                onChange={(event) => set('seseo', event.target.checked)}
              />
              seseo
            </label>
            <label className="flex flex-col gap-1">
              <span>velocidad x{speed.toFixed(2)}</span>
              <input
                aria-label="Velocidad"
                type="range"
                min={0.5}
                max={2}
                step={0.05}
                value={speed}
                onChange={(event) => set('speed', Number(event.target.value))}
              />
            </label>
            <label
              className="flex flex-col gap-1"
              title="Cuánto se solapan una forma y la siguiente"
            >
              <span>pausa entre palabras {interWordMs} ms</span>
              <input
                aria-label="Pausa entre palabras"
                type="range"
                min={0}
                max={400}
                step={10}
                value={interWordMs}
                onChange={(event) => set('interWordMs', Number(event.target.value))}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>exageración x{exaggeration.toFixed(2)}</span>
              <input
                aria-label="Exageración"
                type="range"
                min={0.5}
                max={1.6}
                step={0.1}
                value={exaggeration}
                onChange={(event) => set('exaggeration', Number(event.target.value))}
              />
            </label>
            <label
              className="flex flex-col gap-1"
              title="Cuánto se solapan una forma y la siguiente"
            >
              <span>transición {Math.round(crossfade)} ms</span>
              <input
                aria-label="Transición"
                type="range"
                min={0}
                max={250}
                step={10}
                value={crossfade}
                onChange={(event) => set('crossfadeMs', Number(event.target.value))}
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 border-t border-current/15 pt-3 text-sm">
            <h3 className="text-sm font-semibold">Voz</h3>
            <label
              className="flex items-center gap-2"
              title="Hablar la palabra con speechSynthesis"
            >
              <input
                type="checkbox"
                checked={voz}
                onChange={(event) => set('voz', event.target.checked)}
              />
              voz
            </label>
            {voice.supported ? (
              <>
                <label className="flex flex-col gap-1">
                  <span>género preferido</span>
                  <select
                    aria-label="Género de la voz"
                    value={gender}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        gender: event.target.value as Gender,
                        voiceName: undefined,
                      }))
                    }
                    className="rounded border border-current/20 px-2 py-1 text-xs"
                  >
                    <option value="mujer">mujer</option>
                    <option value="hombre">hombre</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span>voz del navegador</span>
                  <select
                    aria-label="Voz del navegador"
                    value={voice.selected?.name ?? ''}
                    onChange={(event) => set('voiceName', event.target.value)}
                    className="rounded border border-current/20 px-2 py-1 text-xs"
                  >
                    {available.length === 0 && <option value="">sin voces en español</option>}
                    {available.map((candidate) => (
                      <option key={candidate.name} value={candidate.name}>
                        {candidate.name} · {candidate.lang} ·{' '}
                        {candidate.localService ? 'local' : 'red'} · {genderOf(candidate) ?? '?'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span>volumen {Math.round(volume * 100)}%</span>
                  <input
                    aria-label="Volumen"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(event) => set('volume', Number(event.target.value))}
                  />
                </label>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 font-mono text-xs">
                  <dt className="opacity-60">rate</dt>
                  <dd>{measurement === undefined ? '—' : `x${measurement.rate.toFixed(2)}`}</dd>
                  <dt className="opacity-60">objetivo</dt>
                  <dd>
                    {Math.round(spokenMs)} ms
                    {speech.endMs - speech.startMs > spokenMs
                      ? ` (+${Math.round(speech.endMs - speech.startMs - spokenMs)} de pausas)`
                      : ''}
                  </dd>
                  <dt className="opacity-60">medido</dt>
                  <dd>
                    {measurement === undefined
                      ? '—'
                      : `${Math.round(measurement.measuredMs)} ms (${Math.round(measurement.spokenMs)} hablando)`}
                  </dd>
                  <dt className="opacity-60">desfase</dt>
                  <dd
                    className={
                      measurement !== undefined && Math.abs(drift) > DRIFT_TOLERANCE_MS
                        ? 'font-semibold text-red-600'
                        : ''
                    }
                  >
                    {measurement === undefined
                      ? '—'
                      : `${drift > 0 ? '+' : ''}${Math.round(drift)} ms`}
                  </dd>
                  <dt className="opacity-60">margen de la voz</dt>
                  <dd>
                    {voice.pace === undefined ? '—' : `${Math.round(voice.pace.overheadMs)} ms`}
                  </dd>
                  <dt className="opacity-60">arranque</dt>
                  <dd>{Math.round(voice.latencyMs)} ms</dd>
                  <dt className="opacity-60">síl/s de la voz</dt>
                  <dd>{voice.pace?.syllablesPerSecond.toFixed(2) ?? '—'}</dd>
                </dl>
                <p className="text-xs opacity-60">
                  La voz se estira con <code>rate</code> hasta durar lo mismo que la parte hablada
                  de la línea de tiempo, y el reloj de la animación arranca cuando la voz suena, no
                  al pulsar. Desfase positivo: la voz dura más que los labios. Idioma:{' '}
                  <code>{langFor(dialect)}</code>.
                </p>
              </>
            ) : (
              <p className="text-xs opacity-60">
                Este navegador no expone speechSynthesis. La boca se anima igual, sin voz.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 border-t border-current/15 pt-3">
            <h3 className="text-sm font-semibold">Capas visibles</h3>
            <ul aria-label="Capas visibles" className="flex gap-3 font-mono text-xs">
              {layers.map((layer, index) => (
                <li key={index} style={{ opacity: 0.35 + layer.opacity * 0.65 }}>
                  {soundLabel(layer.phoneme ?? 'REST')} {layer.viseme}{' '}
                  {Math.round(layer.opacity * 100)}%
                </li>
              ))}
            </ul>
            <p className="text-xs opacity-60">
              Postura que se está mostrando y cuánto pesa. Durante una transición se mezclan dos
              posturas y sus porcentajes suman 100.
            </p>
          </div>
        </aside>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Palabras que merece la pena probar</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PRESETS.map((group) => (
            <div key={group.title} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-1">
                {group.words.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => load(word)}
                    className="rounded border border-current/20 px-2 py-0.5 text-sm hover:bg-current/10"
                  >
                    {word}
                  </button>
                ))}
              </div>
              <p className="text-xs font-medium">{group.title}</p>
              <p className="text-xs opacity-60">
                <Rich text={group.hint} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <Alphabet shapes={shapes} held={held} onHold={setHeld} />

      <Tuner
        shapes={shapes}
        selected={tuned}
        onSelect={selectTuned}
        onChange={tuneShape}
        onReset={resetShapes}
      />
    </main>
  );
};
