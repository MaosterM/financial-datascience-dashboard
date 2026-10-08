'use client';
import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HoverPanel } from '@/components/shell/Shell';
import { Slider, Stat } from '@/components/ui';
import { useStore } from '@/lib/store';
import { gauss, prices, pth } from '@/lib/quant';

function MonteCarlo() {
  const { value } = useStore(), start = value > 0 ? value : 10000;
  const [mu, setMu] = useState(8), [sg, setSg] = useState(20), [run, setRun] = useState(0), [st, setSt] = useState({ mean: start, p5: start, loss: 0 });
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, x = c.getContext('2d')!, N = 300, T = 126, dt = 1 / 252, W = c.width, H = c.height;
    const P = Array.from({ length: N }, () => { const p = [start]; for (let t = 1; t < T; t++) p.push(p[t - 1] * Math.exp((mu / 100 - 0.5 * (sg / 100) ** 2) * dt + (sg / 100) * Math.sqrt(dt) * gauss(Math.random))); return p; });
    const mean = Array.from({ length: T }, (_, t) => d3.mean(P, (p) => p[t])!), end = P.map((p) => p[T - 1]).sort((a, b) => a - b);
    setSt({ mean: mean[T - 1], p5: end[Math.floor(N * 0.05)], loss: end.filter((v) => v < start).length / N });
    const lo = end[0] * 0.98, hi = end[N - 1] * 1.02, X = (t: number) => (t / (T - 1)) * W, Y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
    x.clearRect(0, 0, W, H); let t = 1, raf = 0;
    const step = () => {
      for (let k = 0; k < 2 && t < T; k++, t++) {
        x.lineWidth = 1; x.strokeStyle = 'rgba(34,229,255,0.07)'; x.beginPath(); P.forEach((p) => { x.moveTo(X(t - 1), Y(p[t - 1])); x.lineTo(X(t), Y(p[t])); }); x.stroke();
        x.lineWidth = 2; x.strokeStyle = '#10f5a0'; x.beginPath(); x.moveTo(X(t - 1), Y(mean[t - 1])); x.lineTo(X(t), Y(mean[t])); x.stroke();
      }
      if (t < T) raf = requestAnimationFrame(step);
    };
    step(); return () => cancelAnimationFrame(raf);
  }, [mu, sg, run, start]);
  const $ = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return (
    <HoverPanel title={`MONTE CARLO · 300 PATHS · 6M · START $${$(start)}${value > 0 ? ' (YOUR PORTFOLIO)' : ' (DEMO)'}`} drawer={<p className="text-[var(--cyan)]">Geometric Brownian motion. Green line = mean path.</p>}>
      <div className="grid sm:grid-cols-3 gap-4 p-3"><Slider l="Drift %/yr" v={mu} min={-10} max={30} on={setMu} /><Slider l="Vol %/yr" v={sg} min={5} max={60} on={setSg} />
        <button onClick={() => setRun((r) => r + 1)} className="border border-[var(--cyan)] text-[var(--cyan)] text-xs">RE-RUN</button></div>
      <canvas ref={ref} width={800} height={300} className="w-full" />
      <div className="grid grid-cols-3 border-t border-[#23252e]"><Stat l="MEAN END" v={`$${$(st.mean)}`} c="var(--green)" /><Stat l="5TH PCTILE (VaR)" v={`$${$(st.p5)}`} c="var(--red)" /><Stat l="P(LOSS)" v={`${(st.loss * 100).toFixed(0)}%`} c="var(--purple)" /></div>
    </HoverPanel>
  );
}

function VolSurface() {
  const ref = useRef<HTMLCanvasElement>(null), ang = useRef(0.6), drag = useRef(false);
  useEffect(() => {
    const x = ref.current!.getContext('2d')!, G = 21, M = 15; let raf = 0;
    const iv = (k: number, T: number) => 0.16 + (0.9 * (k - 1) ** 2) / (0.5 + T) + 0.05 * Math.exp(-2 * T) - 0.08 * (k - 1) * Math.exp(-T);
    const P = (i: number, j: number) => {
      const k = 0.7 + (0.6 * i) / (G - 1), T = 0.1 + (1.9 * j) / (M - 1), v = iv(k, T), a = ang.current, X0 = (k - 1) * 5, Z0 = (T - 1) * 2.4;
      const xr = X0 * Math.cos(a) - Z0 * Math.sin(a), zr = X0 * Math.sin(a) + Z0 * Math.cos(a), d = 7 / (9 + zr);
      return { x: 400 + xr * 110 * d, y: 270 + (-(v - 0.2) * 4 * 0.9 + zr * 0.35) * 110 * d };
    };
    const draw = () => {
      if (!drag.current) ang.current += 0.006;
      x.clearRect(0, 0, 800, 360);
      for (let j = 0; j < M; j++) { x.beginPath(); for (let i = 0; i < G; i++) { const p = P(i, j); i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y); } x.strokeStyle = `hsl(${270 - (j / M) * 90} 90% 60% / .85)`; x.stroke(); }
      for (let i = 0; i < G; i++) { x.beginPath(); for (let j = 0; j < M; j++) { const p = P(i, j); j ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y); } x.strokeStyle = 'rgba(34,229,255,.35)'; x.stroke(); }
      raf = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <HoverPanel title="IMPLIED VOL SURFACE · DRAG TO ROTATE · STRIKE × MATURITY (MODEL SURFACE)" drawer={<p className="text-[var(--cyan)]">Skew plus term structure. Feed it your options chain IV grid.</p>}>
      <canvas ref={ref} width={800} height={360} className="w-full cursor-grab" style={{ touchAction: 'none' }}
        onPointerDown={() => (drag.current = true)} onPointerUp={() => (drag.current = false)} onPointerLeave={() => (drag.current = false)}
        onPointerMove={(e) => { if (drag.current) ang.current += e.movementX * 0.01; }} />
    </HoverPanel>
  );
}

function Drawdown() {
  const dd = useMemo(() => { const e = prices(500, 21, 100, 0.0005, 0.011); let pk = 0; return e.map((v) => { pk = Math.max(pk, v); return v / pk - 1; }); }, []);
  const mn = Math.min(...dd), X = (i: number) => ((i / 499) * 600).toFixed(1), Y = (v: number) => ((v / mn) * 140 + 10).toFixed(1);
  return (
    <HoverPanel title="UNDERWATER CHART · PEAK-TO-TROUGH" drawer={<p className="text-[var(--cyan)]">Each dip is a decline from the running peak.</p>}>
      <svg viewBox="0 0 600 160" className="w-full"><path d={`${pth(dd, X, Y)}L600,10L0,10Z`} fill="var(--red)" fillOpacity=".3" stroke="var(--red)" /></svg>
      <Stat l="MAX DRAWDOWN" v={`${(mn * 100).toFixed(1)}%`} c="var(--red)" />
    </HoverPanel>
  );
}

export default function Risk() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      <div className="lg:col-span-7"><MonteCarlo /></div><div className="lg:col-span-5"><VolSurface /></div>
      <div className="lg:col-span-12"><Drawdown /></div>
    </div>
  );
}
