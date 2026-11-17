type IconProps = { readonly className?: string };

export const ClockIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
    <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

export const HearingAidIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M9 4a4 4 0 0 1 4 4v3.5a3.5 3.5 0 0 0 3.5 3.5"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <rect x={6} y={11} width={4} height={9} rx={2} stroke="currentColor" strokeWidth={1.8} />
  </svg>
);

export const ChildFaceIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx={12} cy={12} r={10} fill="#FFE7AE" />
    <circle cx={8.5} cy={11} r={1.2} fill="#0E2A36" />
    <circle cx={15.5} cy={11} r={1.2} fill="#0E2A36" />
    <path
      d="M8.5 15c1 1 2.3 1.5 3.5 1.5s2.5-.5 3.5-1.5"
      stroke="#0E2A36"
      strokeWidth={1.4}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const ChatDotsIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M4 6h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H10l-4 3v-3H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
      fill="#D1F5CF"
      stroke="#79CB81"
      strokeWidth={1.2}
    />
    <circle cx={9} cy={11} r={1.1} fill="#20652F" />
    <circle cx={13} cy={11} r={1.1} fill="#20652F" />
    <circle cx={17} cy={11} r={1.1} fill="#20652F" />
  </svg>
);

export const RocketIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 2c3 2 4.5 5.5 4.5 9 0 2-.5 3.6-1.2 5l-3.3 3-3.3-3C7.5 14.6 7 13 7 11c0-3.5 1.5-7 5-9Z"
      fill="#E08079"
      stroke="#8E2F27"
      strokeWidth={1}
    />
    <circle cx={12} cy={10} r={2} fill="#fff" />
    <path d="M9 17l-2 3M15 17l2 3" stroke="#8E2F27" strokeWidth={1.4} strokeLinecap="round" />
  </svg>
);

export const EarIcon = ({ className }: IconProps) => (
  <span
    className={`${className ?? ''} inline-flex items-center justify-center text-2xl leading-none`}
  >
    👂
  </span>
);

export const SoundWaveIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M2 12v0M5 8v8M9 4v16M13 8v8M17 4v16M21 8v8"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);
