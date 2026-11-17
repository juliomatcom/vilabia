import type { ReactNode } from 'react';

// The spacer matches the settings panel, so the title centres over the avatar, not the screen.
export const GameHeading = ({
  title,
  children,
}: {
  readonly title: string;
  readonly children?: ReactNode;
}) => (
  <div className="flex w-full gap-6">
    <header className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <h1 className="text-2xl font-bold tracking-wide text-ink uppercase">{title}</h1>
      {children}
    </header>
    <div aria-hidden="true" className="hidden shrink-0 lg:block lg:w-64" />
  </div>
);
