'use client';

import { useState } from 'react';
import { CopyIcon } from '@/components/icons';

export const CopyButton = ({
  label,
  title,
  text,
}: {
  readonly label: string;
  readonly title: string;
  readonly text: () => string;
}) => {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => void navigator.clipboard.writeText(text()).then(() => setCopied(true))}
      onMouseLeave={() => setCopied(false)}
      aria-label={label}
      title={title}
      className="flex shrink-0 items-center gap-1 rounded border border-current/20 px-2 py-1 text-xs hover:bg-current/10"
    >
      <CopyIcon className="h-4 w-4" />
      {copied ? 'copiado' : 'copiar'}
    </button>
  );
};
