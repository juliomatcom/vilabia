'use client';

import { CONSTRUYE_ROUNDS } from '@/lib/application/games/frases/construye';
import { PHRASE_CREDITS } from '@/lib/domain/phrases';
import { WordOrderGame } from '../shared/word-order-game';

export const ConstruyeScreen = () => (
  <WordOrderGame
    rounds={CONSTRUYE_ROUNDS}
    title="Construye la frase"
    instruction="Mira la boca de la logopeda. Después elige solo las palabras que dijo y ponlas en orden."
    tip="¡Cuidado! Hay palabras de más que se parecen, pero la logopeda no las dijo."
    credit={`${PHRASE_CREDITS.porSilaba}; ${PHRASE_CREDITS.encuentraFrase}`}
    finishedMessage="Has construido todas las frases."
  />
);
