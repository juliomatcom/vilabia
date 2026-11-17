import type { MouthShape } from '@/lib/domain/mouth';

export type Ellipse = {
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
};

export type Band = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Lines between the teeth, as one path. */
  readonly gaps: string;
};

/** A stroked overlay: its path and how strongly it shows. */
export type Mark = {
  readonly d: string;
  readonly opacity: number;
};

export type MouthGeometry = {
  readonly upperLip: string;
  readonly lowerLip: string;
  readonly inner: string;
  readonly seam?: Mark & { readonly weight: number };
  readonly upperTeeth?: Band;
  readonly lowerTeeth?: Band;
  readonly tongueLow?: Ellipse;
  /** The raised tongue seen from below, and the frenulum and folds on its underside. */
  readonly tongueUp?: { readonly d: string; readonly frenulum: string };
  /** How far the raised tip travels while it trills, in drawing units. */
  readonly trill: number;
  readonly tongueBack?: Ellipse & { readonly groove: string };
  /** The tongue between the teeth, drawn behind them so only the gap shows it. */
  readonly tongueOut?: Ellipse;
  /** The tongue out of the mouth and over the lower lip, as one path. */
  readonly tongueTip?: string;
  readonly cheeks?: Mark;
  readonly creases?: Mark;
  readonly nasal?: Mark;
  readonly airflow?: Mark;
};

const CX = 100;
const CY = 70;
/** Control-point factor that makes two cubics a half ellipse. */
const ELLIPSE = 0.5523;

/** Template tag for SVG path data: numbers are written with two decimals. */
const path = (strings: TemplateStringsArray, ...values: readonly number[]): string =>
  strings.reduce(
    (out, text, i) => out + text + (i < values.length ? values[i]!.toFixed(2) : ''),
    '',
  );
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Frame = {
  readonly halfWidth: number;
  readonly innerHalf: number;
  readonly cornerY: number;
  readonly top: number;
  readonly bottom: number;
  readonly upperThickness: number;
  readonly lowerThickness: number;
  readonly round: number;
};

const frameOf = (shape: MouthShape): Frame => {
  const halfWidth = 20 + 32 * shape.width + 2 * shape.puff;
  const height = shape.open * 44;
  const fuller = 1 + 0.2 * shape.round;
  const flatHalf = halfWidth * (1 - 0.22 * shape.round) - 2.5;
  const pucker = shape.round ** 4 * (1 - shape.width);
  const parting = lerp(0.3, 1, Math.min(1, shape.open / 0.15));
  return {
    halfWidth,
    innerHalf: Math.max(4, lerp(flatHalf, Math.min(flatHalf, height * 0.6), pucker) * parting),
    cornerY: CY - 6 * shape.cornerLift,
    top: CY - height * 0.45,
    bottom: CY + height * 0.55,
    upperThickness: (6 + 12 * shape.upperLip) * (1 - 0.45 * shape.press) * fuller,
    lowerThickness:
      (7 + 14 * shape.lowerLip) * (1 - 0.4 * shape.press) * (1 - 0.35 * shape.lipTuck) * fuller,
    round: shape.round,
  };
};

/** Opening edge from one inner corner to the other through `edgeY`: a lens when flat, an ellipse when round. */
const edge = (frame: Frame, edgeY: number, from: -1 | 1): string => {
  const { innerHalf, cornerY, round } = frame;
  const rise = cornerY - edgeY;
  const start = CX + from * innerHalf;
  const shoulder = innerHalf * lerp(0.5, ELLIPSE, round);
  return [
    path`C ${start} ${cornerY - rise * ELLIPSE * round} ${CX + from * shoulder} ${edgeY} ${CX} ${edgeY}`,
    path`C ${CX - from * shoulder} ${edgeY} ${CX - from * innerHalf} ${cornerY - rise * ELLIPSE * round} ${CX - from * innerHalf} ${cornerY}`,
  ].join(' ');
};

const innerPath = (frame: Frame): string =>
  [
    path`M ${CX - frame.innerHalf} ${frame.cornerY}`,
    edge(frame, frame.top, -1),
    edge(frame, frame.bottom, 1),
    'Z',
  ].join(' ');

const upperLipPath = (frame: Frame): string => {
  const { halfWidth, innerHalf, cornerY, top, upperThickness: t, round } = frame;
  const bow = Math.min(halfWidth * 0.3, 13) * (1 - 0.4 * round);
  const peak = top - t - 1;
  const dip = top - t * (0.7 + 0.2 * round);
  const lift = (cornerY - peak) * (0.55 + 0.35 * round);
  return [
    path`M ${CX - halfWidth} ${cornerY}`,
    path`C ${CX - halfWidth * 0.8} ${cornerY - lift} ${CX - bow * 1.9} ${peak} ${CX - bow} ${peak}`,
    path`Q ${CX - bow * 0.35} ${peak} ${CX} ${dip}`,
    path`Q ${CX + bow * 0.35} ${peak} ${CX + bow} ${peak}`,
    path`C ${CX + bow * 1.9} ${peak} ${CX + halfWidth * 0.8} ${cornerY - lift} ${CX + halfWidth} ${cornerY}`,
    path`L ${CX + innerHalf} ${cornerY}`,
    edge(frame, top, 1),
    'Z',
  ].join(' ');
};

const lowerLipPath = (frame: Frame): string => {
  const { halfWidth, innerHalf, cornerY, bottom, lowerThickness: t, round } = frame;
  const low = bottom + t;
  const drop = (low - cornerY) * (0.6 + 0.3 * round);
  return [
    path`M ${CX + halfWidth} ${cornerY}`,
    path`C ${CX + halfWidth * 0.85} ${cornerY + drop} ${CX + halfWidth * 0.5} ${low} ${CX} ${low}`,
    path`C ${CX - halfWidth * 0.5} ${low} ${CX - halfWidth * 0.85} ${cornerY + drop} ${CX - halfWidth} ${cornerY}`,
    path`L ${CX - innerHalf} ${cornerY}`,
    edge(frame, bottom, -1),
    'Z',
  ].join(' ');
};

const gapsPath = (offsets: readonly number[], limit: number, y: number, height: number): string =>
  offsets
    .flatMap((offset) => (offset === 0 ? [0] : [-offset, offset]))
    .filter((offset) => Math.abs(offset) < limit)
    .map((offset) => path`M ${CX + offset} ${y} L ${CX + offset} ${y + height}`)
    .join(' ');

const UPPER_GAPS = [0, 9, 17, 24, 30, 36, 42];
const LOWER_GAPS = [5, 11, 17, 23, 29, 35];

const when = <T>(condition: boolean, value: () => T): T | undefined =>
  condition ? value() : undefined;

const mark = (amount: number, d: () => string): Mark | undefined =>
  when(amount > 0.05, () => ({ d: d(), opacity: Math.min(1, amount) }));

/** Short dashes along a line, for air leaving the nose or the mouth. */
const dashes = (x: number, y: number, dx: number, dy: number, count: number): string =>
  Array.from({ length: count }, (_, i) => {
    const t = i / count;
    return path`M ${x + dx * t} ${y + dy * t} l ${(dx / count) * 0.5} ${(dy / count) * 0.5}`;
  }).join(' ');

/** Where the opening's upper and lower edges sit at `x`, near enough for strokes on the lips. */
const edgeAt = (frame: Frame, x: number, edgeY: number): number =>
  lerp(edgeY, frame.cornerY, Math.min(1, ((x - CX) / frame.innerHalf) ** 2));

export const toGeometry = (shape: MouthShape): MouthGeometry => {
  const frame = frameOf(shape);
  const { halfWidth, innerHalf, cornerY, top, bottom } = frame;
  const height = bottom - top;
  const upperHeight = shape.upperTeeth * Math.min(height * 0.6 + 3, 12);
  const lowerHeight = shape.lowerTeeth * Math.min(height * 0.5 + 3, 9);
  const contact = Math.max(0, 1 - shape.open / 0.12);
  const tipY = lerp(bottom, top + upperHeight * 0.6, Math.min(1, shape.tongueUp / 0.8));
  const tongueBase = innerHalf * Math.max(0.3, 2 * shape.tongueUp - 0.8);
  const raisedTip = innerHalf * (0.25 + 0.55 * shape.tongueUp);
  const tongueAt = (share: number) => lerp(bottom, tipY, share);
  const gapTop = top + upperHeight;
  const gapBottom = bottom - lowerHeight;
  const tipOut = Math.max(0, (shape.tongueOut - 0.6) / 0.4);
  const bandRy = Math.min(Math.max(1, gapBottom - gapTop) / 2 + 2, 6.5);
  const tipReach = 1 - (1 - tipOut) ** 2;
  const tipHalf = innerHalf * 0.85 * tipReach;
  const tipLow = lerp(gapTop, bottom + frame.lowerThickness * 0.65, tipReach);
  const inside = height > 2;
  const band = (gaps: readonly number[], y: number, bandHeight: number): Band => ({
    x: CX - innerHalf,
    y,
    width: innerHalf * 2,
    height: bandHeight,
    gaps: gapsPath(gaps, innerHalf, y, bandHeight),
  });
  const back = {
    cx: CX,
    cy: bottom,
    rx: innerHalf * 0.85 * Math.sqrt(shape.tongueBack),
    ry: height * 0.65 * shape.tongueBack,
  };

  return {
    upperLip: upperLipPath(frame),
    lowerLip: lowerLipPath(frame),
    inner: innerPath(frame),
    seam: when(contact > 0.02, () => ({
      d: [
        path`M ${CX - halfWidth} ${cornerY}`,
        path`L ${CX - innerHalf} ${cornerY}`,
        edge(frame, top, -1),
        path`L ${CX + halfWidth} ${cornerY}`,
      ].join(' '),
      opacity: contact * (0.45 + shape.press * 0.5),
      weight: 1 + shape.press * 2.6,
    })),
    upperTeeth: when(upperHeight > 0.5, () => band(UPPER_GAPS, top - 2, upperHeight + 2)),
    lowerTeeth: when(lowerHeight > 0.5, () =>
      band(LOWER_GAPS, bottom - lowerHeight, lowerHeight + 2),
    ),
    tongueLow: when(shape.tongueLow > 0.02 && inside, () => ({
      cx: CX,
      cy: bottom,
      rx: innerHalf * 0.7 * Math.sqrt(shape.tongueLow),
      ry: height * 0.35 * shape.tongueLow,
    })),
    tongueUp: when(shape.tongueUp > 0.02 && inside, () => ({
      d: [
        path`M ${CX - tongueBase} ${bottom + 2}`,
        path`C ${CX - tongueBase * 0.9} ${tongueAt(0.7)} ${CX - raisedTip * 1.3} ${tipY} ${CX} ${tipY}`,
        path`C ${CX + raisedTip * 1.3} ${tipY} ${CX + tongueBase * 0.9} ${tongueAt(0.7)} ${CX + tongueBase} ${bottom + 2}`,
        'Z',
      ].join(' '),
      frenulum: [
        path`M ${CX} ${bottom + 2} L ${CX} ${tongueAt(0.55)}`,
        path`M ${CX - raisedTip * 0.9} ${tongueAt(0.3)} L ${CX} ${tongueAt(0.6)} L ${CX + raisedTip * 0.9} ${tongueAt(0.3)}`,
      ].join(' '),
    })),
    trill: 2.5 * shape.trill,
    tongueBack: when(shape.tongueBack > 0.02 && inside, () => ({
      ...back,
      groove: path`M ${CX} ${back.cy - back.ry * 0.85} L ${CX} ${back.cy - back.ry * 0.3}`,
    })),
    tongueOut: when(shape.tongueOut > 0.02 && height > 1, () => ({
      cx: CX,
      cy: Math.max((gapTop + gapBottom) / 2, gapBottom + 2 - bandRy),
      rx: innerHalf * (0.85 + 0.3 * shape.tongueOut),
      ry: bandRy * Math.min(1, shape.tongueOut * 2),
    })),
    tongueTip: when(tipOut > 0 && height > 1, () =>
      [
        path`M ${CX - tipHalf} ${gapTop}`,
        path`C ${CX - tipHalf} ${lerp(gapTop, tipLow, 0.85)} ${CX - tipHalf * 0.55} ${tipLow} ${CX} ${tipLow}`,
        path`C ${CX + tipHalf * 0.55} ${tipLow} ${CX + tipHalf} ${lerp(gapTop, tipLow, 0.85)} ${CX + tipHalf} ${gapTop}`,
        'Z',
      ].join(' '),
    ),
    cheeks: mark(shape.puff * 0.8, () =>
      [-1, 1]
        .flatMap((side) => [0, 5].map((step) => ({ side, x: CX + side * (halfWidth + 7 + step) })))
        .map(({ side, x }) => path`M ${x} ${CY - 10} Q ${x - side * 5} ${CY} ${x} ${CY + 10}`)
        .join(' '),
    ),
    creases: mark(shape.creases, () =>
      [-0.6, -0.36, -0.12, 0.12, 0.36, 0.6]
        .map((share) => CX + share * halfWidth)
        .flatMap((x) => {
          const lean = (x - CX) * 0.08;
          const upper = edgeAt(frame, x, top);
          const lower = edgeAt(frame, x, bottom);
          return [
            path`M ${x} ${upper - 0.5} L ${x + lean} ${upper - frame.upperThickness * 0.55}`,
            path`M ${x} ${lower + 0.5} L ${x + lean} ${lower + frame.lowerThickness * 0.5}`,
          ];
        })
        .join(' '),
    ),
    nasal: mark(shape.nasal, () =>
      [-1, 1]
        .flatMap((side) => [0, 3.5].map((spread) => ({ side, spread })))
        .map(({ side, spread }) => dashes(CX + side * (11 + spread), 27, side * spread, 16, 3))
        .join(' '),
    ),
    airflow: mark(shape.airflow, () =>
      [-18, -10, -2, 6, 14]
        .map((x) => dashes(CX + x, bottom + frame.lowerThickness + 5, -4, 16, 3))
        .join(' '),
    ),
  };
};
