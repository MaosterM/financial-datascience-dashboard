'use client';
import { useEffect, useRef, useState } from 'react';
export type Level = { p: number; q: number };
export type Snap = { mid: number; bids: Level[]; asks: Level[]; ticks: number[] };

const book = (mid: number, seeded = false): Pick<Snap, 'bids' | 'asks'> => {
  const side = (s: 1 | -1) => Array.from({ length: 12 }, (_, i) => ({
    p: +(mid + s * (i + 1) * 0.25).toFixed(2), q: seeded ? 20 + ((i * 37) % 160) : Math.round(20 + Math.random() * 180) }));
  return { bids: side(-1), asks: side(1) };
};

/** Pass a ws URL (gateway fed by Flink job output) or omit for a 10 Hz simulated feed. */
export function useStream(wsUrl?: string): Snap {
  const mid = useRef(5240);
  const [s, set] = useState<Snap>({ mid: 5240, ...book(5240, true), ticks: [] });
  useEffect(() => {
    if (wsUrl) {
      const ws = new WebSocket(wsUrl);
      ws.onmessage = (e) => { const d = JSON.parse(e.data); set((p) => ({ ...d, ticks: [...p.ticks.slice(-239), d.mid] })); };
      return () => ws.close();
    }
    const id = setInterval(() => {
      mid.current += (Math.random() - 0.5) * 0.9;
      set((p) => ({ mid: mid.current, ...book(mid.current), ticks: [...p.ticks.slice(-239), mid.current] }));
    }, 100);
    return () => clearInterval(id);
  }, [wsUrl]);
  return s;
}
