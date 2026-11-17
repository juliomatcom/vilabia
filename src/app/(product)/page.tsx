import type { Metadata } from 'next';
import { ChatDotsIcon, ChildFaceIcon, ClockIcon, EarIcon, RocketIcon } from './hero-icons';
import { MicIcon } from '@/components/icons';
import { WelcomePlayer } from './welcome-player';

export const metadata: Metadata = {
  title: 'Logopedia online: Aprende a leer los labios jugando',
  description:
    'Ejercicios gratuitos para entrenar la lectura labial con un avatar animado. Útil para logopedas, terapia con un logopeda infantil, y para personas con pérdida auditiva o hipoacusia.',
  keywords: [
    'lectura labial',
    'leer los labios',
    'logopeda online',
    'ejercicios de logopedia',
    'logopeda infantil',
    'pérdida auditiva',
    'hipoacusia',
    'sordera',
    'entrenamiento auditivo',
    'comunicación cara a cara',
  ],
  alternates: { canonical: '/' },
};

const FAQ: readonly { readonly q: string; readonly a: string }[] = [
  {
    q: '¿Por qué es importante la lectura labial para las personas sordas?',
    a: 'La mayoría de las conversaciones cotidianas ocurren en persona, sin subtítulos. Leer los labios permite seguir a la familia, a los compañeros de trabajo y a los amigos en tiempo real, y reduce el aislamiento que aparece cuando solo se puede comunicar por escrito o a través de un intérprete.',
  },
  {
    q: '¿La lectura labial sustituye a la lengua de signos o a los audífonos?',
    a: 'No. Es una habilidad complementaria. Funciona junto a la lengua de signos, los audífonos y los implantes cocleares, y cubre los momentos en los que esas ayudas no bastan: entornos ruidosos, varias personas hablando o un interlocutor que no signa.',
  },
  {
    q: '¿Vilabia sirve para niños?',
    a: 'Sí. La dificultad es progresiva y el formato es de juego, con un avatar amigable y rondas cortas. Es un buen apoyo entre sesiones con un logopeda infantil.',
  },
  {
    q: '¿Vilabia sustituye las sesiones con un logopeda?',
    a: 'No. Es un complemento, no un reemplazo. Una sesión con un profesional evalúa, corrige y adapta el trabajo a cada persona; nada de eso lo hace una web. Pero las sesiones suelen ser cortas y a veces caras, y el avance depende de lo que se practica entre una y otra. Vilabia cubre justo ese hueco: los «deberes», gratis y sin límite de tiempo, para llegar a la siguiente sesión con más práctica hecha.',
  },
  {
    q: '¿Necesito una cuenta o pagar algo?',
    a: 'No. Los ejercicios son gratuitos y se juegan directamente en el navegador, sin registro y sin instalar nada.',
  },
  {
    q: '¿Funciona sin conexión?',
    a: 'El motor que convierte el texto en movimiento de labios funciona en tu dispositivo. Solo la voz opcional del avatar puede necesitar conexión según el navegador.',
  },
];

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Vilabia',
    url: 'https://vilabia.com',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    description:
      'Ejercicios de logopedia online: entrena la lectura labial con un avatar animado. Apoyo para logopedas infantiles y de adultos, y para personas con pérdida auditiva o hipoacusia.',
    inLanguage: 'es-ES',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
];

const BENEFITS: readonly {
  readonly title: string;
  readonly body: string;
  readonly icons: readonly [typeof ClockIcon, typeof ClockIcon];
}[] = [
  {
    title: 'Ejercicios a demanda',
    body: 'Entrena cuando quieras con rondas cortas y efectivas, sin cita previa.',
    icons: [ClockIcon, MicIcon],
  },
  {
    title: 'Divertido para niños',
    body: 'Dificultad progresiva y amena, con un avatar amigable y sin atascos.',
    icons: [ChildFaceIcon, RocketIcon],
  },
  {
    title: 'Apoyo para hipoacusia',
    body: 'Mejora tu lectura labial con subtítulos en pantalla y un avatar claro.',
    icons: [EarIcon, ChatDotsIcon],
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-8 pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <div className="flex flex-col gap-2">
        <h1 className="text-ink text-2xl font-bold sm:text-3xl lg:text-4xl">
          Logopedia online: Aprende a leer los labios jugando
        </h1>
        <p className="text-ink-soft text-base">
          Ejercicios gratuitos para entrenar la lectura labial con un avatar animado. Útil para
          logopedas y personas con pérdida auditiva.
        </p>
      </div>

      <WelcomePlayer />

      <section className="grid gap-6 sm:grid-cols-3">
        {BENEFITS.map(({ title, body, icons: [First, Second] }) => (
          <div key={title} className="bg-surface flex flex-col gap-3 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <First className="text-ink h-7 w-7" />
              <Second className="text-ink h-6 w-6" />
            </div>
            <h2 className="text-ink text-sm font-bold tracking-wide uppercase">{title}</h2>
            <p className="text-ink-soft text-sm">{body}</p>
          </div>
        ))}
      </section>

      <section className="bg-surface flex flex-col gap-4 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-ink text-xl font-bold sm:text-2xl">
          Por qué leer los labios importa tanto
        </h2>
        <p className="text-ink-soft text-sm sm:text-base">
          Para muchas personas sordas y con hipoacusia, la conversación en persona es el terreno más
          difícil: no lleva subtítulos, va rápida y no se puede rebobinar. La lectura labial
          devuelve acceso a esas situaciones —una comida familiar, una reunión, una charla con un
          vecino— y evita que la persona quede al margen de la comunicación cara a cara.
        </p>
        <p className="text-ink-soft text-sm sm:text-base">
          No es una habilidad que sustituya a nada. Se apoya en el resto de la información
          disponible: el contexto, los gestos, los restos auditivos, los audífonos o el implante
          coclear, y la lengua de signos cuando el interlocutor la conoce. Entrenarla amplía el
          margen para participar en cualquier entorno, sobre todo en los ruidosos o con varias
          personas hablando a la vez.
        </p>
        <p className="text-ink-soft text-sm sm:text-base">
          También es útil para el entorno: familiares, profesorado y profesionales sanitarios que
          quieren comunicarse mejor, y para cualquier persona con pérdida auditiva relacionada con
          la edad. Vilabia practica el reconocimiento de palabras que se ven casi iguales en los
          labios (<span className="text-ink font-medium">pala</span>,{' '}
          <span className="text-ink font-medium">bala</span>,{' '}
          <span className="text-ink font-medium">mala</span>), que es justo donde la lectura labial
          falla y donde el entrenamiento marca la diferencia.
        </p>
        <p className="text-ink-soft text-sm sm:text-base">
          Está pensado como complemento del trabajo con un logopeda, no como sustituto. Las rondas
          cortas y repetibles encajan bien entre sesiones y permiten practicar en casa a cualquier
          edad.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink text-xl font-bold sm:text-2xl">Preguntas frecuentes</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="bg-surface group rounded-2xl p-5 shadow-sm [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="text-ink flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold sm:text-base">
                {q}
                <span className="text-brand shrink-0 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-ink-soft mt-3 text-sm sm:text-base">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
