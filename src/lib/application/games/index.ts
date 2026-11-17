export type GameMeta = {
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly seo: {
    readonly title: string;
    readonly description: string;
  };
};

export const GAMES: readonly GameMeta[] = [
  {
    slug: 'adivina-la-palabra',
    name: '¡Adivina la palabra!',
    tagline: 'El avatar articula una palabra y tú eliges cuál es entre cuatro tarjetas.',
    seo: {
      title: '¡Adivina la palabra! — Ejercicio de lectura labial',
      description:
        'Juega a ¡Adivina la palabra!: un ejercicio de logopedia online para practicar lectura labial. Elige la palabra que articula el avatar entre cuatro tarjetas, con dificultad progresiva.',
    },
  },
  {
    slug: 'frases-por-silaba',
    name: 'Frases por sílaba',
    tagline:
      'Frases cortas para practicar una sílaba: ba, pa, ma… El avatar dice una y tú eliges cuál ha sido.',
    seo: {
      title: 'Frases por sílaba — Lectura labial de frases cortas',
      description:
        'Ejercicio de lectura labial con frases cortas agrupadas por sílabas (ba, ma, pa, ta…), preparadas por logopedas. El avatar articula una frase y eliges cuál ha dicho.',
    },
  },
  {
    slug: 'que-frase-dijo',
    name: '¿Qué frase dijo?',
    tagline: 'El avatar dice una frase y tú la encuentras entre cuatro frases casi iguales.',
    seo: {
      title: '¿Qué frase dijo? — Ejercicio de lectura labial de frases',
      description:
        'Practica la lectura labial con frases completas: el avatar articula una frase y la eliges entre cuatro que solo cambian en una palabra. Ejercicio de logopedia online con dificultad progresiva.',
    },
  },
  {
    slug: 'ordena-la-frase',
    name: 'Ordena la frase',
    tagline: 'El avatar dice una frase y tú colocas sus palabras en el orden en que las dijo.',
    seo: {
      title: 'Ordena la frase — Lectura labial y memoria',
      description:
        'Ejercicio de lectura labial y memoria: mira cómo el avatar articula una frase y ordena sus palabras desordenadas. Logopedia online para niños y adultos.',
    },
  },
  {
    slug: 'construye-la-frase',
    name: 'Construye la frase',
    tagline:
      'Como Ordena la frase, pero con palabras de más: elige solo las que dijo el avatar y ponlas en orden.',
    seo: {
      title: 'Construye la frase — Lectura labial con palabras parecidas',
      description:
        'Ejercicio de lectura labial: el avatar articula una frase y la construyes eligiendo sus palabras entre otras que se parecen en los labios. Logopedia online con dificultad progresiva.',
    },
  },
];

export const gameBySlug = (slug: string): GameMeta | undefined =>
  GAMES.find((game) => game.slug === slug);
