'use client';

import { memo } from 'react';
import type { ShapeTable, Sound } from '@/lib/domain/mouth';
import { AlphabetChart } from '@/components/alphabet-chart';

const AlphabetPanel = ({
  shapes,
  held,
  onHold,
}: {
  shapes: ShapeTable;
  held: Sound | undefined;
  onHold: (sound: Sound) => void;
}) => (
  <section className="flex flex-col gap-3 rounded border border-current/15 p-4">
    <header className="flex flex-col gap-1">
      <h2 className="text-base font-semibold">Alfabeto</h2>
      <p className="text-sm opacity-70">
        Cada letra con la forma de boca de su sonido, como en la lámina de logopedia. Pulsa un
        sonido para ver su forma quieta arriba; pulsa Hablar para volver a la palabra.
      </p>
    </header>
    <AlphabetChart shapes={shapes} picked={held} onPick={onHold} />
  </section>
);

export const Alphabet = memo(AlphabetPanel);
