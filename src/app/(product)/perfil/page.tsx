import type { Metadata } from 'next';
import { ScreenTitle } from '@/components/screen-title';

export const metadata: Metadata = {
  title: 'Mi perfil',
  robots: { index: false, follow: true },
};

export default function Perfil() {
  return <ScreenTitle>Mi perfil</ScreenTitle>;
}
