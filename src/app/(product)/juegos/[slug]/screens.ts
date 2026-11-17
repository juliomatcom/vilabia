import type { ComponentType } from 'react';
import { AdivinaScreen } from '../adivina-la-palabra/screen';
import { ConstruyeScreen } from '../construye-la-frase/screen';
import { PorSilabaScreen } from '../frases-por-silaba/screen';
import { OrdenaScreen } from '../ordena-la-frase/screen';
import { QueFraseScreen } from '../que-frase-dijo/screen';

export const GAME_SCREENS: Record<string, ComponentType> = {
  'adivina-la-palabra': AdivinaScreen,
  'frases-por-silaba': PorSilabaScreen,
  'que-frase-dijo': QueFraseScreen,
  'ordena-la-frase': OrdenaScreen,
  'construye-la-frase': ConstruyeScreen,
};
