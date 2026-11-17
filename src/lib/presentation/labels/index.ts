import type { Viseme } from '@/lib/domain/viseme';

/**
 * Reading order for the legend, not the canonical `VISEMES` order: silence first, then
 * the five vowels (the easiest shapes to start on), then the consonants front to back.
 */
export const VISEME_DISPLAY_ORDER: readonly Viseme[] = [
  'REST',
  'A',
  'E',
  'I',
  'O',
  'U',
  'BILABIAL',
  'LABIODENTAL',
  'INTERDENTAL',
  'DENTAL',
  'SIBILANT',
  'POSTALVEOLAR',
  'PALATAL',
  'VELAR',
];

/** Spanish display name for each viseme code. The code stays the internal id. */
export const VISEME_NAME_ES: Readonly<Record<Viseme, string>> = {
  REST: 'Reposo',
  BILABIAL: 'Bilabial',
  LABIODENTAL: 'Labiodental',
  INTERDENTAL: 'Interdental',
  DENTAL: 'Dental',
  SIBILANT: 'Sibilante',
  POSTALVEOLAR: 'Postalveolar',
  PALATAL: 'Palatal',
  VELAR: 'Velar',
  A: 'A',
  E: 'E',
  I: 'I',
  O: 'O',
  U: 'U',
};

/** What the mouth visibly does, per viseme. Therapist-reviewed copy. */
export const VISEME_MOUTH: Readonly<Record<Viseme, string>> = {
  REST: 'Cerrada, en reposo. Antes y después de la palabra.',
  BILABIAL: 'Los labios se juntan y cierran.',
  LABIODENTAL: 'El labio inferior toca los dientes de arriba.',
  INTERDENTAL: 'La punta de la lengua entre los dientes. Se ve.',
  DENTAL: 'La lengua detrás de los dientes, boca apenas abierta.',
  SIBILANT: 'Dientes casi juntos, ranura estrecha.',
  POSTALVEOLAR: 'Labios hacia delante y redondeados.',
  PALATAL: 'Dorso de la lengua arriba, labios neutros.',
  VELAR: 'Parte posterior de la lengua. Casi no se aprecia.',
  A: 'Abierta, mandíbula baja, labios sin redondear.',
  E: 'Medio abierta, comisuras estiradas.',
  I: 'Estrecha, comisuras muy estiradas.',
  O: 'Medio abierta, labios redondeados y hacia delante.',
  U: 'Abertura pequeña, labios muy redondeados y adelantados.',
};
