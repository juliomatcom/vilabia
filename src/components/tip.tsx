import { BulbIcon } from './icons';

export const Tip = ({ children }: { readonly children: React.ReactNode }) => (
  <div className="bg-panel text-ink-soft flex items-start gap-3 rounded-2xl px-5 py-4 text-sm">
    <BulbIcon className="text-brand mt-0.5 h-5 w-5 shrink-0" />
    <p>
      <span className="text-ink font-semibold">Consejo: </span>
      {children}
    </p>
  </div>
);
