'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartIcon,
  CloseIcon,
  GamepadIcon,
  GearIcon,
  HomeIcon,
  MenuIcon,
  MouthIcon,
  UserIcon,
  type IconProps,
} from './icons';
import { Wordmark } from './wordmark';

const NAV_ITEMS: readonly {
  readonly href: string;
  readonly label: string;
  readonly Icon: (props: IconProps) => React.JSX.Element;
  readonly disabled?: boolean;
}[] = [
  { href: '/', label: 'INICIO', Icon: HomeIcon },
  { href: '/formas-de-la-boca', label: 'FORMAS', Icon: MouthIcon },
  { href: '/juegos', label: 'JUEGOS', Icon: GamepadIcon },
  { href: '/progreso', label: 'PROGRESO', Icon: ChartIcon, disabled: true },
  { href: '/perfil', label: 'MI PERFIL', Icon: UserIcon, disabled: true },
];

const ITEM_BASE =
  'flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold tracking-wide transition-colors';

export const Sidebar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-surface flex shrink-0 flex-col gap-4 rounded-3xl p-4 md:w-64 md:gap-6 md:p-5">
      <div className="flex items-center justify-between">
        <Wordmark />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="sidebar-nav"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          className="text-ink hover:bg-canvas -mr-1 rounded-full p-2 transition-colors md:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
      <ul id="sidebar-nav" className={`flex-col gap-1.5 md:flex ${open ? 'flex' : 'hidden'}`}>
        {NAV_ITEMS.map(({ href, label, Icon, disabled }) => {
          if (disabled) {
            return (
              <li key={href}>
                <span
                  aria-disabled="true"
                  title="Disponible próximamente"
                  className={`${ITEM_BASE} text-ink-soft/50 cursor-not-allowed`}
                >
                  <Icon />
                  {label}
                </span>
              </li>
            );
          }
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`${ITEM_BASE} ${
                  active ? 'bg-brand text-white' : 'text-ink hover:bg-canvas'
                }`}
              >
                <Icon />
                {label}
              </Link>
            </li>
          );
        })}
        <li className="md:hidden">
          <span
            aria-disabled="true"
            title="Disponible próximamente"
            className={`${ITEM_BASE} text-ink-soft/50 cursor-not-allowed`}
          >
            <GearIcon />
            AJUSTES
          </span>
        </li>
      </ul>
    </nav>
  );
};
