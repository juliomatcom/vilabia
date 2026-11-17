import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Debugger } from './debugger';

export const metadata: Metadata = {
  title: 'Vilabia — Debugger visemas',
  robots: { index: false, follow: false },
};

export default function DebugPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <Debugger />;
}
