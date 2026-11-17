export type IconProps = {
  readonly className?: string;
};

const base = 'h-5 w-5';

export const HomeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path
      d="M4 11.5 12 4l8 7.5M6 10v9h5v-5h2v5h5v-9"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const GamepadIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path
      d="M7 8h10a4 4 0 0 1 4 4.2l.4 3.3a2 2 0 0 1-3.6 1.5L16 15H8l-1.8 2a2 2 0 0 1-3.6-1.5l.4-3.3A4 4 0 0 1 7 8Z"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <path
      d="M8.5 10.5v3M7 12h3M15.2 11h.01M17.4 13h.01"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);

export const ChartIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path
      d="M5 19V10M12 19V5M19 19v-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);

export const UserIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <circle cx={12} cy={8.5} r={3.5} stroke="currentColor" strokeWidth={1.8} />
    <path
      d="M5 20c1.1-3.4 4-5 7-5s5.9 1.6 7 5"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);

export const GearIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.8} />
    <path
      d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M17.8 6.2l-1.4 1.4M7.6 16.4l-1.4 1.4M17.8 17.8l-1.4-1.4M7.6 7.6 6.2 6.2"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);

export const MenuIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
  </svg>
);

export const MouthIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path
      d="M4 11c2.5-2 5.5-3 8-3s5.5 1 8 3c-2 4-5 6-8 6s-6-2-8-6Z"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <path
      d="M7 10.5c3 1.4 7 1.4 10 0"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);

export const BulbIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path
      d="M9 17h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.2 1 2v.5h6v-.5c0-.8.3-1.4 1-2A6 6 0 0 0 12 3Z"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MicIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <rect x={9} y={3} width={6} height={11} rx={3} stroke="currentColor" strokeWidth={1.8} />
    <path
      d="M6 11a6 6 0 0 0 12 0M12 17v3.5M9 20.5h6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
);

export const CheckIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path
      d="M5 12.5 9.5 17 19 7"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PlayIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? base} aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const PauseIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? base} aria-hidden="true">
    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
  </svg>
);

export const RefreshIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path
      d="M4 12a8 8 0 0 1 14-5.2M20 12a8 8 0 0 1-14 5.2M15.5 6h4.5V1.5M8.5 18H4v4.5"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CopyIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path
      d="M9 9h10v12H9zM5 15V3h10v2"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SoundIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path
      d="M4 9h3l4-3.5v13L7 15H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MuteIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden="true">
    <path
      d="M4 9h3l4-3.5v13L7 15H4zM16 9.5l4 5M20 9.5l-4 5"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
