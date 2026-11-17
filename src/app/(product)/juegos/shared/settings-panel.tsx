const difficultyLabel = (value: number): string =>
  value <= -5 ? 'Fácil' : value >= 5 ? 'Difícil' : 'Media';

export const SettingsPanel = ({
  genero,
  velocidad,
  onVelocidadChange,
  dificultad,
  onDificultadChange,
}: {
  readonly genero: string;
  readonly velocidad: number;
  readonly onVelocidadChange: (value: number) => void;
  readonly dificultad: number;
  readonly onDificultadChange: (value: number) => void;
}) => (
  <aside className="w-full shrink-0 overflow-hidden rounded-2xl border border-edge bg-panel shadow-lg lg:mt-6 lg:w-64">
    <header className="bg-edge px-5 py-3 text-sm font-bold tracking-wide text-ink">
      CUSTOMIZAR MODELO
    </header>
    <div className="flex flex-col gap-4 p-5 text-sm text-ink">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wide">GÉNERO</span>
        <select
          value={genero}
          disabled
          className="rounded-lg border border-edge bg-white px-3 py-2 uppercase opacity-60"
        >
          <option value="mujer">Mujer</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="flex justify-between text-xs font-bold tracking-wide">
          <span>VELOCIDAD:</span>
          <span className="tabular-nums text-brand">x{velocidad.toFixed(2)}</span>
        </span>
        <input
          aria-label="Velocidad"
          type="range"
          min={0.5}
          max={2}
          step={0.05}
          value={velocidad}
          onChange={(event) => onVelocidadChange(Number(event.target.value))}
          className="accent-brand"
        />
        <span className="text-xs text-ink-soft">x0.5 (Lenta) -- x1.0 -- x2.0 (Rápida)</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="flex justify-between text-xs font-bold tracking-wide">
          <span>DIFICULTAD:</span>
          <span className="text-brand">{difficultyLabel(dificultad)}</span>
        </span>
        <input
          aria-label="Dificultad"
          type="range"
          min={-5}
          max={5}
          step={5}
          value={dificultad}
          onChange={(event) => onDificultadChange(Number(event.target.value))}
          className="accent-brand"
        />
        <span className="text-xs text-ink-soft">Fácil -- Media -- Difícil</span>
      </label>
    </div>
  </aside>
);
