import type { Metadata } from 'next';
import { ScreenTitle } from '@/components/screen-title';

export const metadata: Metadata = {
  title: 'Progreso',
  robots: { index: false, follow: true },
};

export default function Progreso() {
  return <ScreenTitle>Progreso</ScreenTitle>;
}
