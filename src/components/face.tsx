'use client';

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import type { MouthShape } from '@/lib/domain/mouth';
import { MouthArt } from './mouth-art';

const SKIN = '#c8926b';
const SKIN_SHADE = '#a97354';
const SOFT = '#96634a';
const LINE = '#4a3226';
const BROW = '#6b4327';
const HAIR = '#734427';
const HAIR_DARK = '#513017';
const HAIR_LIGHT = '#a9714a';
const SHIRT = '#a9cfdd';
const SHIRT_DARK = '#8bbacf';

const EYE_Y = 223;
const VIEW_W = 400;
const VIEW_H = 440;
const GAZE_X = 6;
const GAZE_Y = 3;
const GAZE_REACH = 130;
const MOUTH_X = 200;
const MOUTH_Y = 300;
const MOUTH_SCALE = 0.76;

type Point = { readonly x: number; readonly y: number };

const CENTRED: Point = { x: 0, y: 0 };

const gazeFrom = (pointer: Point | undefined, cx: number): Point => {
  if (pointer === undefined) return CENTRED;
  const dx = pointer.x - cx;
  const dy = pointer.y - EYE_Y;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) return CENTRED;
  const reach = Math.min(1, distance / GAZE_REACH);
  return { x: (dx / distance) * GAZE_X * reach, y: (dy / distance) * GAZE_Y * reach };
};

const usePointer = (ref: RefObject<SVGSVGElement | null>, enabled: boolean): Point | undefined => {
  const [pointer, setPointer] = useState<Point | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;
    const pending: { id: number; event?: PointerEvent } = { id: 0 };

    const apply = () => {
      pending.id = 0;
      const svg = ref.current;
      const event = pending.event;
      if (svg === null || event === undefined) return;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      setPointer({
        x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
        y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
      });
    };

    const onMove = (event: PointerEvent) => {
      pending.event = event;
      if (pending.id === 0) pending.id = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (pending.id !== 0) cancelAnimationFrame(pending.id);
    };
  }, [ref, enabled]);

  return pointer;
};

/** Draws `children` as they are and again mirrored across the face's centre line. */
const BothSides = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <g transform={`matrix(-1 0 0 1 ${VIEW_W} 0)`}>{children}</g>
  </>
);

const Strand = ({
  d,
  color,
  width,
  opacity,
}: {
  d: string;
  color: string;
  width: number;
  opacity: number;
}) => (
  <path
    d={d}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    opacity={opacity}
  />
);

const Eye = ({ cx, look, blink }: { cx: number; look: Point; blink: boolean }) => {
  const clipId = useId();
  const half = 21;
  const lid = `M${cx - half} ${EYE_Y} Q${cx} ${EYE_Y - 16} ${cx + half} ${EYE_Y} Q${cx} ${EYE_Y + 13} ${cx - half} ${EYE_Y} Z`;

  return (
    <g className={blink ? 'vilabia-eye' : undefined}>
      <defs>
        <clipPath id={clipId}>
          <path d={lid} />
        </clipPath>
      </defs>
      <path d={lid} fill="#fdfdfc" />
      <g clipPath={`url(#${clipId})`}>
        <circle cx={cx + look.x} cy={EYE_Y + 1 + look.y} r={10.5} fill="#6b4a2e" />
        <circle cx={cx + look.x} cy={EYE_Y + 1 + look.y} r={4.3} fill="#241408" />
        <circle cx={cx + look.x + 3.4} cy={EYE_Y - 3 + look.y} r={2.4} fill="#ffffff" />
      </g>
      <path
        d={`M${cx - half} ${EYE_Y} Q${cx} ${EYE_Y - 16} ${cx + half} ${EYE_Y}`}
        fill="none"
        stroke={LINE}
        strokeWidth={3.3}
        strokeLinecap="round"
      />
      <path
        d={`M${cx - half} ${EYE_Y} Q${cx} ${EYE_Y + 13} ${cx + half} ${EYE_Y}`}
        fill="none"
        stroke={LINE}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d={`M${cx - half + 4} ${EYE_Y - 10} Q${cx} ${EYE_Y - 21} ${cx + half - 4} ${EYE_Y - 10}`}
        fill="none"
        stroke={LINE}
        strokeWidth={1.6}
        opacity={0.4}
      />
    </g>
  );
};

export const Face = ({
  shape,
  alive = false,
  speaking = false,
  label,
  className,
  airOpacity,
}: {
  shape: MouthShape;
  /** Idle liveliness: blink and pointer-follow gaze. Only an active game turns it on. */
  alive?: boolean;
  speaking?: boolean;
  label?: string;
  className?: string;
  airOpacity?: number;
}) => {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const idle = alive && !speaking;
  const pointer = usePointer(svgRef, idle);
  const gaze = idle ? pointer : undefined;
  const skinId = `${id}-skin`;
  const hairId = `${id}-hair`;
  const cheekId = `${id}-cheek`;
  const neckId = `${id}-neck`;
  const jaw = shape.open;
  const chin = 348 + jaw * 14;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 440"
      className={className ?? 'h-full w-full'}
      {...(label === undefined ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
    >
      {alive && (
        <style>{`
          @keyframes vilabia-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.06); } }
          .vilabia-eye { animation: vilabia-blink 6.8s infinite; transform-box: fill-box; transform-origin: center; }
        `}</style>
      )}

      <defs>
        <radialGradient id={skinId} cx="50%" cy="34%" r="66%">
          <stop offset="0%" stopColor="#dba87f" />
          <stop offset="62%" stopColor={SKIN} />
          <stop offset="100%" stopColor="#ad7a55" />
        </radialGradient>
        <linearGradient id={hairId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8d5732" />
          <stop offset="55%" stopColor={HAIR} />
          <stop offset="100%" stopColor="#5a3318" />
        </linearGradient>
        <linearGradient
          id={neckId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={chin - 26}
          x2="0"
          y2={chin + 30}
        >
          <stop offset="0%" stopColor={SKIN_SHADE} stopOpacity={0.75} />
          <stop offset="100%" stopColor={SKIN_SHADE} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={cheekId}>
          <stop offset="0%" stopColor={SKIN_SHADE} stopOpacity={0.5} />
          <stop offset="100%" stopColor={SKIN_SHADE} stopOpacity={0} />
        </radialGradient>
      </defs>

      <ellipse
        cx={200}
        cy={52}
        rx={45}
        ry={34}
        fill={`url(#${hairId})`}
        stroke={LINE}
        strokeWidth={4}
      />
      {[
        'M168 60 C170 36 214 28 232 50',
        'M172 72 C182 52 222 50 234 66',
        'M178 36 C192 24 218 26 228 38',
      ].map((d) => (
        <Strand key={d} d={d} color={HAIR_DARK} width={2.4} opacity={0.5} />
      ))}
      <Strand d="M176 40 C186 30 202 28 214 32" color={HAIR_LIGHT} width={4} opacity={0.45} />

      <path
        d={`M156 ${chin - 26} C157 366 152 382 146 396 L254 396 C248 382 243 366 244 ${chin - 26} Z`}
        fill={`url(#${skinId})`}
        stroke={LINE}
        strokeWidth={4}
      />
      <path
        d={`M158 ${chin - 26} C158 366 154 382 148 396 L252 396 C246 382 242 366 242 ${chin - 26} Z`}
        fill={`url(#${neckId})`}
      />

      <path
        d="M-8 440 C6 424 58 400 140 392 L200 432 L260 392 C342 400 394 424 408 440 Z"
        fill={SHIRT}
        stroke={LINE}
        strokeWidth={4}
      />
      <path d="M140 392 L200 432 L260 392" fill={SHIRT_DARK} stroke={LINE} strokeWidth={4} />
      <BothSides>
        <path
          d="M140 392 L200 432 L188 378 L162 384 Z"
          fill={SHIRT}
          stroke={LINE}
          strokeWidth={4}
        />
      </BothSides>
      <rect
        x={256}
        y={412}
        width={84}
        height={24}
        rx={4}
        fill="#f6f6f4"
        stroke={LINE}
        strokeWidth={3}
      />
      <path d="M264 424 L332 424" stroke={LINE} strokeWidth={3} opacity={0.4} />

      <path
        d={`M200 78 C246 78 281 112 287 172 C291 200 291 222 288 238 C286 262 281 278 272 ${chin - 48} C265 ${chin - 32} 251 ${chin - 16} 228 ${chin - 6} C219 ${chin - 2} 211 ${chin} 200 ${chin} C189 ${chin} 181 ${chin - 2} 172 ${chin - 6} C149 ${chin - 16} 135 ${chin - 32} 128 ${chin - 48} C119 278 114 262 112 238 C109 222 109 200 113 172 C119 112 154 78 200 78 Z`}
        fill={`url(#${skinId})`}
        stroke={LINE}
        strokeWidth={4}
      />

      <path
        d="M104 246 C101 190 106 118 138 88 C158 70 175 66 200 66 C225 66 242 70 262 88 C294 118 299 190 296 246 L288 228 C277 204 265 184 251 162 C236 139 218 134 200 134 C182 134 164 139 149 162 C135 184 123 204 112 228 Z"
        fill={`url(#${hairId})`}
        stroke={LINE}
        strokeWidth={4}
      />
      <Strand d="M200 134 C200 116 199 100 198 84" color={HAIR_DARK} width={3} opacity={0.6} />
      <BothSides>
        <Strand d="M195 88 C172 100 153 124 140 160" color={HAIR_DARK} width={2.6} opacity={0.45} />
        <Strand d="M191 98 C167 114 145 142 135 186" color={HAIR_LIGHT} width={2.2} opacity={0.4} />
        <Strand d="M188 112 C163 132 142 164 133 210" color={HAIR_DARK} width={2} opacity={0.3} />
      </BothSides>
      <Strand d="M146 106 C162 86 182 78 204 77" color={HAIR_LIGHT} width={8} opacity={0.28} />

      <BothSides>
        <ellipse cx={134} cy={272} rx={24} ry={40} fill={`url(#${cheekId})`} />
      </BothSides>
      <ellipse cx={200} cy={334} rx={34} ry={20} fill={`url(#${cheekId})`} opacity={0.5} />

      <BothSides>
        <path
          d="M123 216 C110 210 102 227 104 244 C106 261 114 271 123 267 C118 252 118 231 123 216 Z"
          fill={SKIN}
          stroke={LINE}
          strokeWidth={3.5}
        />
        <path
          d="M119 230 C112 236 112 250 118 258 C121 250 121 238 119 230 Z"
          fill={SKIN_SHADE}
          opacity={0.55}
        />
        <Strand
          d="M121 220 C111 217 106 230 107 244 C108 254 112 260 117 262"
          color={SOFT}
          width={2.2}
          opacity={0.7}
        />
        <circle cx={112} cy={266} r={2.8} fill="#e6c16f" stroke="#9c7a33" strokeWidth={1} />
      </BothSides>

      <BothSides>
        <path d="M191 189 C177 176 158 176 142 189 C158 183 177 184 191 195 Z" fill={BROW} />
      </BothSides>

      <Eye cx={167} look={gazeFrom(gaze, 167)} blink={alive} />
      <Eye cx={233} look={gazeFrom(gaze, 233)} blink={alive} />

      <path
        d="M194 230 C191 244 190 256 193 264"
        fill="none"
        stroke={SKIN_SHADE}
        strokeWidth={2.6}
        strokeLinecap="round"
        opacity={0.45}
      />
      <ellipse cx={200} cy={261} rx={12} ry={8} fill={SKIN_SHADE} opacity={0.22} />
      <path
        d="M190 268 Q200 274 210 268"
        fill="none"
        stroke={SOFT}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <BothSides>
        <ellipse
          cx={191}
          cy={265}
          rx={3}
          ry={1.8}
          fill={LINE}
          opacity={0.7}
          transform="rotate(-25 191 265)"
        />
      </BothSides>

      <g
        transform={`translate(${MOUTH_X - 100 * MOUTH_SCALE} ${MOUTH_Y + (jaw * 20 - 70) * MOUTH_SCALE}) scale(${MOUTH_SCALE})`}
      >
        <MouthArt shape={shape} airOpacity={airOpacity} />
      </g>
    </svg>
  );
};
