'use client';

import { useEffect, useRef, useState } from 'react';
import { IDLE_BLEND_MS, easeWeight } from '@/lib/domain/mouth';

/** 1 while idle, 0 while speaking, eased between the two instead of switching. */
export const useIdleWeight = (idle: boolean, durationMs: number = IDLE_BLEND_MS): number => {
  const target = idle ? 1 : 0;
  const [weight, setWeight] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    const from = current.current;
    if (from === target) return;
    const startedAt = performance.now();
    const frame = { id: 0 };
    const tick = () => {
      const value = easeWeight(from, target, performance.now() - startedAt, durationMs);
      current.current = value;
      setWeight(value);
      if (value !== target) frame.id = requestAnimationFrame(tick);
    };
    frame.id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.id);
  }, [target, durationMs]);

  return weight;
};
