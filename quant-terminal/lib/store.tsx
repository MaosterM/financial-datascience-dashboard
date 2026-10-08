'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
export type Tx = { id: number; t: string; kind: 'deposit' | 'withdraw' | 'buy' | 'sell'; sym?: string; amt: number };
type S = { cash: number; pos: Record<string, number>; txs: Tx[]; name: string; risk: string };
const init: S = { cash: 0, pos: {}, txs: [], name: 'Trader', risk: 'Balanced' };
export const PRICES: Record<string, number> = { AAPL: 190, NVDA: 880, MSFT: 420, SPY: 524, BTC: 67000, XAU: 2330 };
const Ctx = createContext<any>(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, set] = useState<S>(init);
  useEffect(() => { try { const x = localStorage.getItem('qhud'); if (x) set(JSON.parse(x)); } catch {} }, []);
  const save = (n: S) => { set(n); try { localStorage.setItem('qhud', JSON.stringify(n)); } catch {} };
  const log = (n: S, kind: Tx['kind'], amt: number, sym?: string): S => ({ ...n, txs: [{ id: Date.now(), t: new Date().toLocaleString('en-US'), kind, sym, amt }, ...n.txs].slice(0, 100) });
  const value = s.cash + Object.entries(s.pos).reduce((a, [k, q]) => a + q * (PRICES[k] ?? 0), 0);
  const api = {
    ...s, value,
    deposit: (a: number) => { if (!(a > 0)) return 'Enter an amount'; save(log({ ...s, cash: s.cash + a }, 'deposit', a)); return ''; },
    withdraw: (a: number) => { if (!(a > 0)) return 'Enter an amount'; if (a > s.cash) return 'Exceeds available cash'; save(log({ ...s, cash: s.cash - a }, 'withdraw', a)); return ''; },
    trade: (sym: string, q: number, side: 'buy' | 'sell') => {
      const c = PRICES[sym] * q, have = s.pos[sym] ?? 0;
      if (!(q > 0)) return 'Enter a quantity';
      if (side === 'buy') { if (c > s.cash) return 'Insufficient cash, top up first'; save(log({ ...s, cash: s.cash - c, pos: { ...s.pos, [sym]: have + q } }, 'buy', c, sym)); }
      else { if (q > have) return 'Not enough units'; save(log({ ...s, cash: s.cash + c, pos: { ...s.pos, [sym]: have - q } }, 'sell', c, sym)); }
      return '';
    },
    update: (p: Partial<S>) => save({ ...s, ...p }),
    reset: () => save(init),
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
