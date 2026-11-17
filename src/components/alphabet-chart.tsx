'use client';

import { SHAPES, type ShapeTable, type Sound } from '@/lib/domain/mouth';
import { ALPHABET, VISEME_OF } from '@/lib/domain/viseme';
import { VISEME_MOUTH, VISEME_NAME_ES } from '@/lib/presentation/labels';
import { ParametricMouth } from './parametric-mouth';

export const soundLabel = (sound: Sound): string => (sound === 'REST' ? 'reposo' : `/${sound}/`);

const describe = (sound: Sound): string =>
  sound === 'REST'
    ? 'Muda: la boca no hace nada'
    : `${VISEME_NAME_ES[VISEME_OF[sound]]}: ${VISEME_MOUTH[VISEME_OF[sound]]}`;

const PICKABLE =
  'flex flex-col items-center rounded border px-1 py-0.5 font-mono text-xs border-current/20 hover:bg-current/10 aria-pressed:border-current/40 aria-pressed:bg-current/20 aria-pressed:font-semibold';

/**
 * Every letter of the alphabet with the mouth of each sound it can stand for, after the
 * speech therapist's chart. Static on `/formas-de-la-boca`; on `/debug`, `onPick` makes each
 * mouth a button. Styling rides `currentColor` so it sits on either surface.
 */
export const AlphabetChart = ({
  shapes = SHAPES,
  picked,
  onPick,
}: {
  readonly shapes?: ShapeTable;
  readonly picked?: Sound;
  readonly onPick?: (sound: Sound) => void;
}) => (
  <ul aria-label="Alfabeto" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
    {ALPHABET.map(({ letter, sounds, note }) => {
      const shown: readonly Sound[] = sounds.length === 0 ? ['REST'] : sounds;
      return (
        <li key={letter} className="flex flex-col gap-1 rounded-lg border border-current/15 p-2">
          <span className="text-lg font-semibold">
            {letter} {letter.length === 1 ? letter.toLowerCase() : ''}
          </span>
          <span className="flex flex-wrap gap-1">
            {shown.map((sound) => {
              const content = (
                <>
                  <ParametricMouth
                    shape={shapes[sound]}
                    viewBox="30 25 140 90"
                    className="h-20 w-32"
                  />
                  {sounds.length === 0 ? 'muda' : soundLabel(sound)}
                </>
              );
              return onPick === undefined ? (
                <span
                  key={sound}
                  title={describe(sound)}
                  className="flex flex-col items-center font-mono text-xs"
                >
                  {content}
                </span>
              ) : (
                <button
                  key={sound}
                  type="button"
                  aria-pressed={picked === sound}
                  title={describe(sound)}
                  onClick={() => onPick(sound)}
                  className={PICKABLE}
                >
                  {content}
                </button>
              );
            })}
          </span>
          {note !== undefined && <span className="text-[11px] opacity-60">{note}</span>}
        </li>
      );
    })}
  </ul>
);
