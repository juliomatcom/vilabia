import { SHAPE_KEYS, SOUNDS, type ShapeTable } from '@/lib/domain/mouth';

/** The shape table as CSV, one row per sound, for pasting back into `SHAPES`. */
export const toCsv = (table: ShapeTable): string =>
  [
    ['sound', ...SHAPE_KEYS].join(','),
    ...SOUNDS.map((sound) =>
      [sound, ...SHAPE_KEYS.map((key) => table[sound][key].toFixed(2))].join(','),
    ),
  ].join('\n');
