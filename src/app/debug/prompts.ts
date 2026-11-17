export const SETTINGS_PROMPT =
  'Vilabia · /debug — aplica esta configuración como la nueva por defecto del código: lleva cada valor a la constante que ya lo define (voz en src/lib/speech/rates.ts, tiempos en src/lib/timing/durations.ts, transición en src/lib/render/, curva de nivel en src/lib/games/adivina/level.ts), que sigue siendo su única copia, y actualiza la página de wiki-llm afectada en el mismo commit. No cambies nada que no aparezca aquí abajo.';

export const SHAPES_PROMPT =
  'Vilabia · /debug — sustituye los valores de SHAPES en src/lib/mouth/shape.ts por esta tabla (CSV, una fila por sonido, con cabecera; REST es el reposo). Ese objeto es la única copia de los valores: no toques la geometría, el render ni los nombres de los parámetros.';
