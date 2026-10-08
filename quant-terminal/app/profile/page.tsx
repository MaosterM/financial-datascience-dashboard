'use client';
import { useState } from 'react';
import { HoverPanel } from '@/components/shell/Shell';
import { Stat } from '@/components/ui';
import { PRICES, useStore } from '@/lib/store';

const $ = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const inp = 'bg-transparent border border-[#23252e] focus:border-[var(--cyan)] outline-none px-2 py-1 text-xs w-full';
const btn = 'border px-3 py-1 text-xs hover:text-white';

export default function Profile() {
  const s = useStore();
  const [amt, setAmt] = useState(''), [sym, setSym] = useState('AAPL'), [qty, setQty] = useState('1'), [msg, setMsg] = useState('');
  const n = parseFloat(amt) || 0, q = parseFloat(qty) || 0, hold = Object.entries(s.pos as Record<string, number>).filter(([, u]) => u > 0);
  const say = (r: string, ok: string) => { setMsg(r || ok); if (!r) setAmt(''); };
  const csv = () => {
    const b = new Blob(['time,type,symbol,amount\n' + s.txs.map((t: any) => [t.t.replace(',', ''), t.kind, t.sym ?? '', t.amt.toFixed(2)].join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'transactions.csv'; a.click();
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      <div className="lg:col-span-5"><HoverPanel title="ACCOUNT · SIMULATED FUNDS, STORED IN THIS BROWSER ONLY" drawer={<p className="text-[var(--cyan)]">No real money moves. Real top-ups need a backend plus a payment provider.</p>}>
        <div className="p-4 grid grid-cols-2 gap-3">
          <input className={inp} value={s.name} onChange={(e) => s.update({ name: e.target.value })} />
          <select className={inp} value={s.risk} onChange={(e) => s.update({ risk: e.target.value })}>{['Conservative', 'Balanced', 'Aggressive'].map((r) => <option key={r} className="bg-black">{r}</option>)}</select>
        </div>
        <div className="grid grid-cols-3 border-y border-[#23252e]"><Stat l="TOTAL" v={$(s.value)} c="var(--green)" /><Stat l="CASH" v={$(s.cash)} /><Stat l="INVESTED" v={$(s.value - s.cash)} c="var(--purple)" /></div>
        <div className="p-4 space-y-3">
          <input className={inp} placeholder="Amount (USD)" value={amt} onChange={(e) => setAmt(e.target.value)} inputMode="decimal" />
          <div className="flex flex-wrap gap-2">{[100, 500, 1000, 5000].map((v) => <button key={v} className={btn} style={{ borderColor: 'var(--line)' }} onClick={() => setAmt(String(v))}>${v}</button>)}</div>
          <div className="flex gap-2">
            <button className={btn} style={{ borderColor: 'var(--green)', color: 'var(--green)' }} onClick={() => say(s.deposit(n), 'Topped up')}>TOP UP</button>
            <button className={btn} style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => say(s.withdraw(n), 'Withdrawn')}>WITHDRAW</button>
            <button className={`${btn} ml-auto`} style={{ borderColor: 'var(--line)' }} onClick={() => confirm('Reset account to $0?') && s.reset()}>RESET</button>
          </div>
          {msg && <p className="text-[11px] text-[var(--cyan)]">{msg}</p>}
        </div>
      </HoverPanel></div>

      <div className="lg:col-span-7"><HoverPanel title="TRADE & HOLDINGS" drawer={<p className="text-[var(--cyan)]">Fixed demo prices. Wire to the live feed later.</p>}>
        <div className="p-4 flex flex-wrap gap-2 items-center">
          <select className={`${inp} !w-auto`} value={sym} onChange={(e) => setSym(e.target.value)}>{Object.keys(PRICES).map((k) => <option key={k} className="bg-black">{k}</option>)}</select>
          <input className={`${inp} !w-24`} value={qty} onChange={(e) => setQty(e.target.value)} inputMode="decimal" />
          <span className="text-[11px] text-[#7d8191]">≈ {$(PRICES[sym] * q)}</span>
          <button className={btn} style={{ borderColor: 'var(--green)', color: 'var(--green)' }} onClick={() => say(s.trade(sym, q, 'buy'), 'Bought')}>BUY</button>
          <button className={btn} style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => say(s.trade(sym, q, 'sell'), 'Sold')}>SELL</button>
        </div>
        <div className="px-4 pb-4 space-y-2 text-xs">{hold.length === 0 ? <p className="text-[#7d8191]">No holdings yet. Top up, then buy.</p> : hold.map(([k, u]) => (
          <div key={k}><div className="flex justify-between"><span>{k} × {u}</span><span>{$(u * PRICES[k])}</span></div>
            <div className="h-1 bg-[#23252e]"><div className="h-1 bg-[var(--cyan)]" style={{ width: `${(u * PRICES[k] / s.value) * 100}%` }} /></div></div>))}</div>
      </HoverPanel></div>

      <div className="lg:col-span-12"><HoverPanel title="TRANSACTION HISTORY" drawer={<button className={btn} style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }} onClick={csv}>EXPORT CSV</button>}>
        <div className="p-4 text-xs space-y-1 max-h-64 overflow-y-auto">{s.txs.length === 0 ? <p className="text-[#7d8191]">Nothing yet.</p> : s.txs.map((t: any) => (
          <div key={t.id} className="flex justify-between"><span className="text-[#7d8191]">{t.t}</span><span>{t.kind}{t.sym ? ` ${t.sym}` : ''}</span><span style={{ color: t.kind === 'deposit' || t.kind === 'sell' ? 'var(--green)' : 'var(--red)' }}>{$(t.amt)}</span></div>))}</div>
      </HoverPanel></div>
    </div>
  );
}
