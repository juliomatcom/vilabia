export const Mark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path
      d="M10.4 4 Q10.4 12 13.8 18.6"
      fill="none"
      stroke="var(--color-brand)"
      strokeWidth={5.4}
      strokeLinecap="round"
    />
    <path
      d="M13.8 18.6 L21.6 7.4"
      fill="none"
      stroke="var(--color-brand)"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <g transform="translate(13.8 19.6) rotate(-7)">
      <path
        d="M-5.3 0 C-3.7 -2.2 -1.6 -2.2 0 -0.7 C1.6 -2.2 3.7 -2.2 5.3 0 C3.7 2.6 -3.7 2.6 -5.3 0 Z"
        fill="#e2504d"
      />
      <path d="M-3.7 0.1 C-1.5 1.1 1.5 1.1 3.7 0.1 C1.7 2.1 -1.7 2.1 -3.7 0.1 Z" fill="#b23a3b" />
    </g>
    <g transform="translate(24 5.6)">
      <path
        d="M-3.3 -2.7 H3.3 A2 2 0 0 1 5.3 -0.7 V1 A2 2 0 0 1 3.3 3 H-1.2 L-4.1 5.5 V3 H-3.3 A2 2 0 0 1 -5.3 1 V-0.7 A2 2 0 0 1 -3.3 -2.7 Z"
        fill="#eaf6f6"
        stroke="var(--color-brand)"
        strokeWidth={1}
      />
      <circle cx={-1.9} cy={0.1} r={0.8} fill="var(--color-ink)" />
      <circle cx={0} cy={0.1} r={0.8} fill="var(--color-ink)" />
      <circle cx={1.9} cy={0.1} r={0.8} fill="var(--color-ink)" />
    </g>
  </svg>
);

export const Wordmark = () => (
  <div className="flex items-center gap-2 px-2">
    <Mark className="h-9 w-9 shrink-0" />
    <span className="text-xl font-bold text-ink">Vilabia</span>
  </div>
);
