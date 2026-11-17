import type { Metadata } from 'next';
import Link from 'next/link';
import { AlphabetChart } from '@/components/alphabet-chart';

export const metadata: Metadata = {
  title: 'Las formas de la boca, letra a letra: el alfabeto para leer los labios',
  description:
    'Guía para empezar a leer los labios en español: la forma que hace la boca con cada letra del alfabeto, qué sonidos tiene cada letra y cuáles se confunden entre sí.',
  keywords: [
    'lectura labial',
    'leer los labios',
    'formas de la boca',
    'alfabeto labial',
    'visemas',
    'fonemas visibles',
    'lectura labiofacial',
    'logopedia',
    'pérdida auditiva',
    'hipoacusia',
  ],
  alternates: { canonical: '/formas-de-la-boca' },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Las formas de la boca, letra a letra',
  description:
    'La forma que hace la boca con cada letra del alfabeto español y con cada uno de sus sonidos.',
  inLanguage: 'es-ES',
  learningResourceType: 'Guía',
  educationalLevel: 'Principiante',
  teaches: 'Lectura labial en español',
  isAccessibleForFree: true,
  url: 'https://vilabia.es/formas-de-la-boca',
};

const CONFUSABLE: readonly { readonly pair: string; readonly note: string }[] = [
  {
    pair: 'p · b · m',
    note: '«pala», «bala» y «mala» se parecen mucho: los labios se juntan en las tres. La /p/ los aprieta y retiene aire, la /b/ deja un pequeño hueco por donde pasa el aire y la /m/ los junta relajados mientras el aire sale por la nariz. Son diferencias finas; el contexto hace el resto.',
  },
  {
    pair: 'r · rr',
    note: '«pero» y «perro» hacen la misma forma. Solo cambia la duración y la vibración de la lengua, que apenas se ve.',
  },
  {
    pair: 'c · qu · g · j',
    note: 'Los sonidos de fondo casi no se aprecian. La boca solo toma la forma de la vocal que va al lado; esa vocal es la pista.',
  },
  {
    pair: 's · z',
    note: 'Solo se distinguen con distinción (centro y norte de España). Con seseo, «casa» y «caza» se ven y suenan igual.',
  },
];

export default function FormasDeLaBoca() {
  return (
    <div className="flex flex-1 flex-col gap-8 pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
          Las formas de la boca, letra a letra
        </h1>
        <p className="text-base text-ink-soft">
          El alfabeto completo, con la forma que hace la boca en cada sonido. Leer los labios
          empieza aquí: reconocer esas formas.
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-ink sm:text-2xl">Qué lees cuando lees los labios</h2>
        <p className="text-sm text-ink-soft sm:text-base">
          No lees letras: lees formas. La boca no dibuja la ortografía, hace un gesto por cada
          sonido, y una misma letra puede tener más de un sonido: la c de «casa» no es la de «cena».
          Muchos sonidos se parecen desde fuera porque el ojo no ve lo que pasa dentro: si vibran
          las cuerdas vocales, si el aire sale por la nariz, si la lengua trabaja al fondo.
        </p>
        <p className="text-sm text-ink-soft sm:text-base">
          Aprender estas formas es la base. A partir de ahí, el contexto de la conversación, el tema
          y la expresión de la cara rellenan los huecos que la boca deja sin resolver.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-ink sm:text-2xl">El alfabeto</h2>
        <p className="text-sm text-ink-soft sm:text-base">
          Cada casilla es una letra. Debajo de cada boca va el sonido, entre barras y en alfabeto
          fonético: las letras con dos sonidos, como la c o la g, muestran las dos bocas. Las rayas
          junto a la boca marcan el aire: por la nariz en la m, la n y la ñ; por la boca en la f, la
          s y la r.
        </p>
        <div className="text-ink">
          <AlphabetChart />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-ink sm:text-2xl">Las que se confunden de serie</h2>
        <p className="text-sm text-ink-soft sm:text-base">
          Algunas formas no se pueden separar solo mirando. No es un defecto del método: es el
          límite de la lectura labial, y saber cuáles son ya es media batalla.
        </p>
        <dl className="flex flex-col gap-3">
          {CONFUSABLE.map(({ pair, note }) => (
            <div
              key={pair}
              className="flex flex-col gap-1 rounded-xl bg-panel p-4 sm:flex-row sm:gap-4"
            >
              <dt className="shrink-0 font-mono text-sm font-semibold text-ink sm:w-32">{pair}</dt>
              <dd className="text-sm text-ink-soft">{note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-hero p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-ink sm:text-2xl">Cómo practicar esto</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-ink/90 sm:text-base">
          <li>
            Ponte frente a alguien —o frente a un espejo— y observa una sola forma cada vez, sin
            prisa.
          </li>
          <li>
            Empieza por las más distintas entre sí: <strong className="text-ink">a</strong>,{' '}
            <strong className="text-ink">o</strong>, <strong className="text-ink">u</strong>,{' '}
            <strong className="text-ink">m</strong>, <strong className="text-ink">f</strong>. Deja
            las parecidas para el final.
          </li>
          <li>
            Cuando reconozcas las formas sueltas, pásalas a palabras: ahí es donde el contexto
            empieza a ayudar.
          </li>
        </ol>
        <Link
          href="/juegos"
          className="self-start rounded-full bg-brand px-6 py-3 text-sm font-bold tracking-wide text-white uppercase shadow-md transition-colors hover:bg-brand-deep"
        >
          Practicar con el juego
        </Link>
      </section>
    </div>
  );
}
