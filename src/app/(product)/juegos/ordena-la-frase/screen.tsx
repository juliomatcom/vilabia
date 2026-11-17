'use client';

import { ORDENA_ROUNDS } from '@/lib/application/games/frases/ordena';
import { PHRASE_CREDITS } from '@/lib/domain/phrases';
import { WordOrderGame } from '../shared/word-order-game';

export const OrdenaScreen = () => (
  <WordOrderGame
    rounds={ORDENA_ROUNDS}
    title="Ordena la frase"
    instruction="Mira la boca de la logopeda. Después toca las palabras en el orden en que las dijo."
    tip="Puedes volver a ver a la logopeda todas las veces que quieras: toca su cara."
    credit={`${PHRASE_CREDITS.porSilaba}; ${PHRASE_CREDITS.ordena}`}
    finishedMessage="Has ordenado todas las frases."
  />
);
