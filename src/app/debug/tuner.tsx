'use client';

import { memo } from 'react';
import {
  SHAPE_KEYS,
  SHAPE_RANGE,
  soundsOf,
  type ShapeKey,
  type ShapeTable,
  type Sound,
} from '@/lib/domain/mouth';
import { toCsv } from '@/lib/presentation/mouth';
import { VISEME_DISPLAY_ORDER, VISEME_NAME_ES } from '@/lib/presentation/labels';
import { ParametricMouth } from '@/components/parametric-mouth';
import { soundLabel } from '@/components/alphabet-chart';
import { CopyButton } from './copy-button';
import { SHAPES_PROMPT } from './prompts';

const LABELS: Readonly<Record<ShapeKey, string>> = {
  open: 'apertura',
  width: 'anchura',
  round: 'redondeo',
  cornerLift: 'comisuras arriba',
  upperLip: 'grosor labio superior',
  lowerLip: 'grosor labio inferior',
  upperTeeth: 'dientes arriba',
  lowerTeeth: 'dientes abajo',
  tongueLow: 'lengua abajo',
  tongueUp: 'punta de la lengua arriba',
  tongueOut: 'lengua entre los dientes',
  tongueBack: 'dorso de la lengua',
  lipTuck: 'labio inferior bajo los dientes',
  press: 'presión de los labios',
  puff: 'mejillas con aire',
  creases: 'arrugas de los labios',
  trill: 'vibración de la lengua',
  nasal: 'aire por la nariz',
  airflow: 'aire por la boca',
};

const TunerPanel = ({
  shapes,
  selected,
  onSelect,
  onChange,
  onReset,
}: {
  shapes: ShapeTable;
  selected: Sound;
  onSelect: (sound: Sound) => void;
  onChange: (sound: Sound, key: ShapeKey, value: number) => void;
  onReset: () => void;
}) => {
  const shape = shapes[selected];

  return (
    <section className="flex flex-col gap-4 rounded border border-current/15 p-4">
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">Ajuste de formas</h2>
          <p className="text-sm opacity-70">
            Cada visema agrupa varios sonidos y cada sonido tiene su propia forma. Elige un sonido,
            mueve los parámetros y mira cómo queda. Los cambios se aplican también a la reproducción
            de arriba. El botón copia la tabla entera, lista para pegar en{' '}
            <code>src/lib/mouth/shape.ts</code>.
          </p>
        </div>
        <CopyButton
          label="Copiar tabla de formas"
          title="Copiar la tabla CSV para pegar en src/lib/mouth/shape.ts"
          text={() => `${SHAPES_PROMPT}\n\n${toCsv(shapes)}`}
        />
      </header>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {VISEME_DISPLAY_ORDER.map((viseme) => (
          <div key={viseme} className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase opacity-50">
              {VISEME_NAME_ES[viseme]}
            </span>
            <div className="flex gap-1">
              {soundsOf(viseme).map((sound) => (
                <button
                  key={sound}
                  type="button"
                  aria-pressed={sound === selected}
                  onClick={() => onSelect(sound)}
                  className={`rounded border px-2 py-1 font-mono text-xs ${
                    sound === selected
                      ? 'border-current/40 bg-current/20 font-semibold'
                      : 'border-current/20 hover:bg-current/10'
                  }`}
                >
                  {soundLabel(sound)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-6 sm:grid-cols-[14rem_minmax(0,1fr)]">
        <ParametricMouth shape={shape} className="w-full" />

        <div className="flex flex-col gap-2">
          {SHAPE_KEYS.map((key) => (
            <label key={key} className="flex items-center gap-3 text-xs">
              <span className="w-64 shrink-0">
                {LABELS[key]} <span className="font-mono opacity-60">({key})</span>
              </span>
              <input
                aria-label={LABELS[key]}
                type="range"
                min={SHAPE_RANGE[key][0]}
                max={SHAPE_RANGE[key][1]}
                step={0.05}
                value={shape[key]}
                onChange={(event) => onChange(selected, key, Number(event.target.value))}
                className="flex-1"
              />
              <span className="w-10 text-right font-mono opacity-70">{shape[key].toFixed(2)}</span>
            </label>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="self-start rounded border border-current/20 px-2 py-1 text-xs hover:bg-current/10"
          >
            volver a los valores del código
          </button>
        </div>
      </div>
    </section>
  );
};

export const Tuner = memo(TunerPanel);
