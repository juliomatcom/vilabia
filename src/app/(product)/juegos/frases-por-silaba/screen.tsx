'use client';

import { useEffect } from 'react';
import {
  answerPorSilaba,
  createPorSilaba,
  groupLabel,
  groupShortLabels,
  nextPorSilaba,
  selectGroup,
} from '@/lib/application/games/frases/por-silaba';
import { phraseExaggeration, progressOf } from '@/lib/application/games/frases/shared';
import { PHRASE_CREDITS, SYLLABLE_GROUPS, type SyllableGroup } from '@/lib/domain/phrases';
import { RoundStage, useRoundPlayer, useSeededGame } from '../shared/round-player';
import {
  AnswerFeedback,
  FinishedPanel,
  SentenceChoices,
  SentenceGameLayout,
} from '../shared/sentence-game';
import { SettingsPanel } from '../shared/settings-panel';

const CORRECT_ADVANCE_MS = 1600;
// A miss stays up longer: the learner reads which sentence it really was before moving on.
const WRONG_ADVANCE_MS = 2800;
const SHORT_LABELS = groupShortLabels(SYLLABLE_GROUPS);

const GroupPicker = ({
  current,
  onSelect,
}: {
  readonly current: number;
  readonly onSelect: (group: number) => void;
}) => (
  <nav aria-label="Elige un sonido" className="flex flex-wrap justify-center gap-2">
    {SYLLABLE_GROUPS.map((group, index) => (
      <button
        key={groupLabel(group)}
        type="button"
        onClick={() => onSelect(index)}
        aria-pressed={index === current}
        aria-label={`Sonido ${groupLabel(group)}`}
        className={`min-w-12 cursor-pointer rounded-full px-3 py-2 text-base font-bold shadow-sm transition ${
          index === current ? 'bg-brand text-white' : 'bg-surface text-ink hover:bg-panel'
        }`}
      >
        {SHORT_LABELS[index]}
      </button>
    ))}
  </nav>
);

export const PorSilabaScreen = () => {
  const [game, setGame] = useSeededGame((rng) => createPorSilaba(rng));
  const group = SYLLABLE_GROUPS[game.group] as SyllableGroup;
  const player = useRoundPlayer(game.round, game.round.target, {
    exaggeration: phraseExaggeration(
      progressOf(game.group, SYLLABLE_GROUPS.length),
      game.difficultyOffset,
    ),
    difficultyOffset: game.difficultyOffset,
  });

  useEffect(() => {
    if (game.phase === 'playing') return;
    const delay = game.phase === 'correct' ? CORRECT_ADVANCE_MS : WRONG_ADVANCE_MS;
    const timer = setTimeout(() => setGame((current) => nextPorSilaba(current)), delay);
    return () => clearTimeout(timer);
  }, [game.phase, game.round, setGame]);

  const recognised = group.sentences.length - game.pending.length;
  const sentenceNumber = Math.min(
    group.sentences.length,
    recognised + (game.phase === 'correct' ? 0 : 1),
  );

  return (
    <SentenceGameLayout
      title="Frases por sílaba"
      instruction="Mira la boca de la logopeda y elige la frase que dice."
      progress={`Sonido ${game.group + 1} de ${SYLLABLE_GROUPS.length} · Frase ${sentenceNumber} de ${group.sentences.length}`}
      tip="Toca un sonido de arriba para practicar solo ese grupo de frases."
      credit={PHRASE_CREDITS.porSilaba}
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
      <div className="mb-6 flex flex-col items-center gap-3">
        <GroupPicker
          current={game.group}
          onSelect={(index) => setGame((current) => selectGroup(current, index))}
        />
        <p className="text-lg font-bold tracking-wide text-brand-deep">{groupLabel(group)}</p>
      </div>

      <RoundStage
        player={player}
        silencedLabel="Ahora mismo no hay voz para esta frase"
        lockedHint="Para elegir una frase, primero escucha a la logopeda."
      />

      {game.finished ? (
        <div className="mt-8">
          <FinishedPanel
            message="Has practicado todos los sonidos."
            onRestart={() =>
              setGame((current) =>
                createPorSilaba(Math.random, { difficultyOffset: current.difficultyOffset }),
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
            onPick={(sentence) => setGame((current) => answerPorSilaba(current, sentence))}
          />
        </>
      )}
    </SentenceGameLayout>
  );
};
