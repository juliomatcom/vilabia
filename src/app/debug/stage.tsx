import { memo } from 'react';
import { Rich } from './rich-text';

const StagePanel = ({
  index,
  title,
  module: moduleName,
  fn,
  page,
  blurb,
  children,
}: {
  index: number;
  title: string;
  module: string;
  fn: string;
  page: string;
  blurb: string;
  children: React.ReactNode;
}) => (
  <section className="flex h-full flex-col gap-3 rounded border border-current/15 p-4">
    <header className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold">
          {index}. {title}
        </h2>
        <code className="font-mono text-xs opacity-60">
          {moduleName} · {fn}
        </code>
        <code className="font-mono text-xs opacity-40">{page}</code>
      </div>
      <p className="text-sm opacity-70">
        <Rich text={blurb} />
      </p>
    </header>
    {children}
  </section>
);

export const Stage = memo(StagePanel);
