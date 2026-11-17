import { act, renderHook } from '@testing-library/react';
import { useIdleWeight } from './idle-weight';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('useIdleWeight', () => {
  it('starts settled, without animating', () => {
    expect(renderHook(() => useIdleWeight(true)).result.current).toBe(1);
    expect(renderHook(() => useIdleWeight(false)).result.current).toBe(0);
  });

  it('eases out of idle when speech starts instead of switching', () => {
    const { result, rerender } = renderHook(({ idle }) => useIdleWeight(idle, 150), {
      initialProps: { idle: true },
    });
    rerender({ idle: false });
    expect(result.current).toBe(1);
    act(() => jest.advanceTimersByTime(75));
    expect(result.current).toBeGreaterThan(0.1);
    expect(result.current).toBeLessThan(0.9);
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe(0);
  });

  it('turns back from wherever it is when idle returns mid-move', () => {
    const { result, rerender } = renderHook(({ idle }) => useIdleWeight(idle, 150), {
      initialProps: { idle: true },
    });
    rerender({ idle: false });
    act(() => jest.advanceTimersByTime(75));
    const midway = result.current;
    rerender({ idle: true });
    act(() => jest.advanceTimersByTime(16));
    expect(Math.abs(result.current - midway)).toBeLessThan(0.2);
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe(1);
  });
});
