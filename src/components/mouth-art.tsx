'use client';

import { useId } from 'react';
import type { MouthShape } from '@/lib/domain/mouth';
import { toGeometry, type Mark } from '@/lib/presentation/mouth';

const OUTLINE = '#7a3532';
const TONGUE = '#c9706d';
const TONGUE_UNDER = '#b75a5a';
const TONGUE_TIP = '#e0928c';
const TONGUE_EDGE = '#a96a63';
const TEETH_GAP = '#cfc8bd';

const Stroke = ({
  mark,
  width = 1.2,
  fade = 1,
}: {
  mark: Mark | undefined;
  width?: number;
  fade?: number;
}) =>
  mark === undefined ? null : (
    <path
      d={mark.d}
      fill="none"
      stroke={OUTLINE}
      strokeWidth={width}
      strokeLinecap="round"
      opacity={mark.opacity * fade}
    />
  );

export const MouthArt = ({
  shape,
  airOpacity = 1,
}: {
  shape: MouthShape;
  /** Scales the air marks (mouth and nose); games lower it so the marks hint rather than give the answer. */
  airOpacity?: number;
}) => {
  const geometry = toGeometry(shape);
  const clipId = useId();
  const { upperTeeth, lowerTeeth, tongueBack, tongueUp, trill } = geometry;

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={geometry.inner} />
        </clipPath>
      </defs>

      <path d={geometry.inner} fill="#3b1416" />

      <g clipPath={`url(#${clipId})`}>
        {tongueBack && (
          <>
            <ellipse {...tongueBack} fill={TONGUE} />
            <path d={tongueBack.groove} stroke="#a3524f" strokeWidth={1.4} strokeLinecap="round" />
          </>
        )}
        {geometry.tongueLow && <ellipse {...geometry.tongueLow} fill={TONGUE} />}
        {tongueUp && (
          <g>
            <path d={tongueUp.d} fill={TONGUE_UNDER} />
            <path
              d={tongueUp.frenulum}
              fill="none"
              stroke="#8e3f40"
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {trill > 0.1 && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0 0; 0 ${trill}; 0 0`}
                dur="0.08s"
                repeatCount="indefinite"
              />
            )}
          </g>
        )}
        {geometry.tongueOut && <ellipse {...geometry.tongueOut} fill={TONGUE_TIP} />}
        {upperTeeth && (
          <>
            <rect {...upperTeeth} fill="#f7f6f3" />
            <path d={upperTeeth.gaps} stroke={TEETH_GAP} strokeWidth={0.8} />
          </>
        )}
        {lowerTeeth && (
          <>
            <rect {...lowerTeeth} fill="#eceae4" />
            <path d={lowerTeeth.gaps} stroke={TEETH_GAP} strokeWidth={0.8} />
          </>
        )}
      </g>

      <path
        d={geometry.lowerLip}
        fill="#c9716b"
        stroke={OUTLINE}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
      {geometry.tongueTip && (
        <path d={geometry.tongueTip} fill={TONGUE_TIP} stroke={TONGUE_EDGE} strokeWidth={1} />
      )}
      <path
        d={geometry.upperLip}
        fill="#b25c58"
        stroke={OUTLINE}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
      <Stroke mark={geometry.seam} width={geometry.seam?.weight} />
      <Stroke mark={geometry.creases} width={0.9} />
      <Stroke mark={geometry.cheeks} width={1.4} />
      <Stroke mark={geometry.nasal} width={1} fade={airOpacity} />
      <Stroke mark={geometry.airflow} width={1} fade={airOpacity} />
    </g>
  );
};
