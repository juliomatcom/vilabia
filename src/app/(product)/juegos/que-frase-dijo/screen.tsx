'use client';

import { useEffect } from 'react';
import {
  answerQueFrase,
  createQueFrase,
  nextQueFrase,
  QUE_FRASE_LEVELS,
} from '@/lib/application/games/frases/que-frase';
import { phraseExaggeration, progressOf } from '@/lib/application/games/frases/shared';
import { PHRASE_CREDITS } from '@/lib/domain/phrases';
import { RoundStage, useRoundPlayer, useSeededGame } from '../shared/round-player';
import {
  AnswerFeedback,
  FinishedPanel,
  SentenceChoices,
  SentenceGameLayout,
} from '../shared/sentence-game';
import { SettingsPanel } from '../shared/settings-panel';

const CORRECT_ADVANCE_MS = 1600;
// A miss stays up longer: the learner reads which sentence it really was before the retry.
const WRONG_ADVANCE_MS = 2800;

export const QueFraseScreen = () => {
  const [game, setGame] = useSeededGame((rng) => createQueFrase(rng));
  const player = useRoundPlayer(game.round, game.round.target, {
    exaggeration: phraseExaggeration(
      progressOf(game.level - 1, QUE_FRASE_LEVELS),
      game.difficultyOffset,
    ),
    difficultyOffset: game.difficultyOffset,
  });

  useEffect(() => {
    if (game.phase === 'playing') return;
    const delay = game.phase === 'correct' ? CORRECT_ADVANCE_MS : WRONG_ADVANCE_MS;
    const timer = setTimeout(() => setGame((current) => nextQueFrase(current)), delay);
    return () => clearTimeout(timer);
  }, [game.phase, game.round, setGame]);

  const done = game.finished && game.phase === 'correct';

  return (
    <SentenceGameLayout
      title="¿Qué frase dijo?"
      instruction="Mira la boca de la logopeda y elige la frase que dice."
      progress={`Nivel: ${game.level} de ${QUE_FRASE_LEVELS}`}
      tip="Las frases se parecen mucho: fíjate en la palabra que cambia."
      credit={PHRASE_CREDITS.encuentraFrase}
      settings={
        <SettingsPanel
          genero="mujer"
          velocidad={player.velocidad}
          onVelocidadChange={player.setVelocidad}
          dificultad={game.difficultyOffset}
          onDificultadChange={(value) =>
            setGame((current) => ({ ...current, difficultyOffset: value }))
          }
        />
      }
    >
      <RoundStage
        player={player}
        silencedLabel="Ahora mismo no hay voz para esta frase"
        lockedHint="Para elegir una frase, primero escucha a la logopeda."
      />
      {done ? (
        <div className="mt-8">
          <FinishedPanel
            message="Has reconocido todas las frases."
            onRestart={() =>
              setGame((current) =>
                createQueFrase(Math.random, { difficultyOffset: current.difficultyOffset }),
              )
            }
          />
        </div>
      ) : (
        <>
          <AnswerFeedback phase={game.phase} />
          <SentenceChoices
            round={game.round}
            phase={game.phase}
            pick={game.pick}
            revealed={player.revealed}
            onPick={(sentence) => setGame((current) => answerQueFrase(current, sentence))}
          />
        </>
      )}
    </SentenceGameLayout>
  );
};
