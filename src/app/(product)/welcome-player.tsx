import Link from 'next/link';
import { Face } from '@/components/face';
import { SMILE_SHAPE } from '@/lib/domain/mouth';
import {
  ChatDotsIcon,
  ChildFaceIcon,
  ClockIcon,
  HearingAidIcon,
  SoundWaveIcon,
} from './hero-icons';

const GREETING = 'Hola, bienvenido';

export const WelcomePlayer = () => (
  <div className="relative mb-12 rounded-[2.5rem] bg-hero px-4 pt-10 pb-10 sm:mb-10 sm:px-10 sm:pb-8">
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
      <ClockIcon className="text-ink-soft absolute top-14 left-1/2 h-8 w-8 -translate-x-47.5" />
      <SoundWaveIcon className="text-ink-soft absolute top-1/2 left-1/2 h-9 w-9 -translate-x-27.5 -translate-y-1/2" />
      <HearingAidIcon className="text-ink-soft absolute top-8 left-1/2 h-9 w-9 -translate-x-12.5" />
      <ChildFaceIcon className="absolute top-8 left-1/2 h-9 w-9 translate-x-27.5" />
      <ChatDotsIcon className="absolute top-24 left-1/2 h-8 w-8 translate-x-42.5" />
    </div>

    <div className="relative mx-auto w-full max-w-72">
      <div className="flex h-64 w-full items-center justify-center sm:h-72">
        <Face shape={SMILE_SHAPE} className="h-52 w-auto sm:h-56" />
      </div>
      <p className="bg-surface text-ink pointer-events-none absolute bottom-0 left-1/2 w-36 -translate-x-1/2 rounded-2xl px-3 py-2 text-center text-sm font-semibold shadow-md sm:top-1/2 sm:bottom-auto sm:left-[calc(100%-0.5rem)] sm:translate-x-0 sm:-translate-y-1/2">
        {GREETING}
      </p>
    </div>

    <Link
      href="/juegos"
      className="bg-brand hover:bg-brand-deep absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full px-6 py-3.5 text-center text-sm font-bold tracking-wide text-white uppercase shadow-md transition-colors sm:px-8 sm:py-4"
    >
      ¡Empezar a practicar!
    </Link>
  </div>
);
