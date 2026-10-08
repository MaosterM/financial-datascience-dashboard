'use client';
import * as d3 from 'd3';
import { useMemo, useState } from 'react';
import { HoverPanel } from '@/components/shell/Shell';
import { Slider, Stat } from '@/components/ui';
import { prices, rng, gauss, pth } from '@/lib/quant';

const sma = (a: number[], n: number) => a.map((_, i) => (i < n - 1 ? NaN : d3.mean(a.slice(i - n + 1, i + 1))!));
const mm = (a: number[]) => [Math.min(...a), Math.max(...a)];
const sign = (v: number) => (v >= 0 ? 'var(--green)' : 'var(--red)');

function Forecast() {
  const [model, setModel] = useState('LSTM');
  const hist = useMemo(() => prices(120, 11), []);
  const f = useMemo(() => {
    const L = hist[119], mu = model === 'LSTM' ? 0.0012 : 0.0005, sg = model === 'LSTM' ? 0.011 : 0.016;
    const m = Array.from({ length: 40 }, (_, t) => L * Math.exp(mu * (t + 1)));
    const w = m.map((v, t) => 1.64 * sg * Math.sqrt(t + 1) * v);
    return { m, up: m.map((v, i) => v + w[i]), lo: m.map((v, i) => v - w[i]) };
  }, [hist, model]);
  const [mn, mx] = mm([...hist, ...f.up, ...f.lo]);
  const X = (i: number) => ((i / 159) * 600).toFixed(1), Y = (v: number) => (220 - ((v - mn) / (mx - mn)) * 220).toFixed(1);
  const band = [...f.up.map((v, i) => `${X(120 + i)},${Y(v)}`), ...f.lo.map((v, i) => `${X(120 + i)},${Y(v)}`).reverse()].join(' ');
  return (
    <HoverPanel title="FORECAST · 95% CONFIDENCE BAND" drawer={<p className="text-[var(--cyan)]">{model}: 40-step horizon, band widens with √t. Swap in your trained model output.</p>}>
      <div className="flex gap-2 p-2 text-[11px]">{['LSTM', 'Prophet'].map((m) => <button key={m} onClick={() => setModel(m)} className="px-2 py-1 border" style={{ borderColor: m === model ? 'var(--cyan)' : 'var(--line)', color: m === model ? 'var(--cyan)' : '#7d8191' }}>{m}</button>)}</div>
      <svg viewBox="0 0 600 220" className="w-full">
        <polygon points={band} fill="var(--purple)" fillOpacity=".25" stroke="var(--purple)" strokeOpacity=".5" />
        <path d={pth(hist, X, Y)} fill="none" stroke="#c9ccd6" />
        <path d={pth([hist[119], ...f.m], X, Y, 119)} fill="none" stroke="var(--cyan)" strokeWidth="2" />
      </svg>
    </HoverPanel>
  );
}

const A = ['SPY', 'QQQ', 'NVDA', 'BTC', 'GLD', 'OIL', 'TLT', 'EURUSD'], B = [1, 1.2, 1.4, 0.6, -0.2, 0.5, -0.7, 0.1];
function Corr() {
  const C = useMemo(() => {
    const fr = rng(3), fac = Array.from({ length: 250 }, () => gauss(fr));
    const R = A.map((_, k) => { const r = rng(50 + k); return fac.map((f) => B[k] * f + gauss(r)); });
    return R.map((a) => R.map((b) => { const ma = d3.mean(a)!, mb = d3.mean(b)!; let s = 0, x = 0, y = 0; a.forEach((v, i) => { s += (v - ma) * (b[i] - mb); x += (v - ma) ** 2; y += (b[i] - mb) ** 2; }); return +(s / Math.sqrt(x * y)).toFixed(2); }));
  }, []);
  const col = d3.scaleLinear<string>().domain([-1, 0, 1]).range(['#ff3b5c', '#12121a', '#22e5ff']);
  const pairs = C.flatMap((r, i) => r.map((v, j) => ({ p: `${A[i]}/${A[j]}`, v, i, j }))).filter((o) => o.j > o.i).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 5);
  return (
    <HoverPanel title="ASSET CORRELATION MATRIX" drawer={<><p className="text-[var(--cyan)] mb-2">Strongest pairs</p>{pairs.map((o) => <p key={o.p}>{o.p} {o.v}</p>)}</>}>
      <svg viewBox="0 0 330 300" className="w-full">
        {C.map((r, i) => r.map((v, j) => <g key={`${i}-${j}`}><rect x={40 + j * 36} y={20 + i * 33} width="34" height="31" fill={col(v)} /><text x={57 + j * 36} y={40 + i * 33} fontSize="9" textAnchor="middle" fill="#fff">{v}</text></g>))}
        {A.map((a, i) => <text key={a} x="36" y={40 + i * 33} fontSize="9" textAnchor="end" fill="#7d8191">{a}</text>)}
      </svg>
    </HoverPanel>
  );
}

function Backtest() {
  const [f, setF] = useState(10), [s, setS] = useState(50), [th, setTh] = useState(0.3);
  const p = useMemo(() => prices(500, 5, 100, 0.0004, 0.012), []);
  const sent = useMemo(() => { const r = rng(9); return p.map(() => r()); }, [p]);
  const R = useMemo(() => {
    const a = sma(p, f), b = sma(p, s), eq = [1], dr: number[] = [];
    for (let i = 1; i < p.length; i++) { const on = a[i - 1] > b[i - 1] && sent[i - 1] > th, r = on ? p[i] / p[i - 1] - 1 : 0; dr.push(r); eq.push(eq[i - 1] * (1 + r)); }
    let pk = 1, dd = 0; eq.forEach((v) => { pk = Math.max(pk, v); dd = Math.min(dd, v / pk - 1); });
    return { eq, bh: p.map((v) => v / p[0]), ret: eq[eq.length - 1] - 1, sh: (d3.mean(dr)! / (d3.deviation(dr) || 1)) * Math.sqrt(252), dd };
  }, [p, sent, f, s, th]);
  const [mn, mx] = mm([...R.eq, ...R.bh]), X = (i: number) => ((i / 499) * 600).toFixed(1), Y = (v: number) => (160 - ((v - mn) / (mx - mn)) * 160).toFixed(1);
  return (
    <HoverPanel title="BACKTEST SANDBOX · SMA CROSS + SENTIMENT FILTER (SIMULATED PRICES)" drawer={<p className="text-[var(--cyan)]">Long when fast SMA &gt; slow SMA and sentiment &gt; threshold, else cash. No fees or slippage.</p>}>
      <div className="grid sm:grid-cols-3 gap-4 p-3">
        <Slider l="Fast MA" v={f} min={3} max={50} on={setF} /><Slider l="Slow MA" v={s} min={20} max={200} on={setS} /><Slider l="Sentiment ≥" v={th} min={0} max={0.9} step={0.05} on={setTh} />
      </div>
      <div className="grid grid-cols-3 border-y border-[#23252e]">
        <Stat l="STRATEGY RETURN" v={`${(R.ret * 100).toFixed(1)}%`} c={sign(R.ret)} /><Stat l="SHARPE" v={R.sh.toFixed(2)} c={sign(R.sh)} /><Stat l="MAX DRAWDOWN" v={`${(R.dd * 100).toFixed(1)}%`} c="var(--red)" />
      </div>
      <svg viewBox="0 0 600 160" className="w-full"><path d={pth(R.bh, X, Y)} fill="none" stroke="#7d8191" /><path d={pth(R.eq, X, Y)} fill="none" stroke="var(--green)" strokeWidth="2" /></svg>
    </HoverPanel>
  );
}

export default function Alpha() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      <div className="lg:col-span-8"><Forecast /></div><div className="lg:col-span-4"><Corr /></div>
      <div className="lg:col-span-12"><Backtest /></div>
    </div>
  );
}
