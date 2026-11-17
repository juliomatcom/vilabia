import { render } from '@testing-library/react';
import { SHAPES, type MouthShape } from '@/lib/domain/mouth';
import { toGeometry, type Mark } from '@/lib/presentation/mouth';
import { MouthArt } from './mouth-art';

const drawnOpacity = (shape: MouthShape, mark: Mark, airOpacity?: number): number =>
  Number(
    render(
      <svg>
        <MouthArt shape={shape} airOpacity={airOpacity} />
      </svg>,
    )
      .container.querySelector(`path[d="${mark.d}"]`)
      ?.getAttribute('opacity'),
  );

describe('MouthArt', () => {
  const airflow = toGeometry(SHAPES.f).airflow!;
  const nasal = toGeometry(SHAPES.m).nasal!;
  const creases = toGeometry(SHAPES.p).creases!;

  it('draws the air marks at full strength by default', () => {
    expect(drawnOpacity(SHAPES.f, airflow)).toBe(airflow.opacity);
  });

  it('fades only the air marks, mouth and nose, by airOpacity', () => {
    expect(drawnOpacity(SHAPES.f, airflow, 0.35)).toBeCloseTo(airflow.opacity * 0.35);
    expect(drawnOpacity(SHAPES.m, nasal, 0.35)).toBeCloseTo(nasal.opacity * 0.35);
    expect(drawnOpacity(SHAPES.p, creases, 0.35)).toBe(creases.opacity);
  });
});
