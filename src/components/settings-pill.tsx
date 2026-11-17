import { GearIcon } from './icons';

export const SettingsPill = () => (
  <button
    type="button"
    disabled
    aria-disabled="true"
    title="Disponible próximamente"
    className="hidden cursor-not-allowed items-center gap-2 self-end rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-ink-soft/50 shadow-sm md:flex"
  >
    <GearIcon />
    Ajustes
  </button>
);
