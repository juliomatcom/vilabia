'use client';

import type { MouthShape } from '@/lib/domain/mouth';
import { MouthArt } from './mouth-art';

export const ParametricMouth = ({
  shape,
  label,
  className,
  viewBox = '0 0 200 140',
}: {
  shape: MouthShape;
  label?: string;
  className?: string;
  /** Crop into the drawing, e.g. for small thumbnails that should show only the mouth. */
  viewBox?: string;
}) => (
  <svg
    viewBox={viewBox}
    className={className ?? 'h-full w-full'}
    {...(label === undefined ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
  >
    <MouthArt shape={shape} />
  </svg>
);
