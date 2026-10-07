'use client';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useStream } from '@/hooks/useStream';
import { HoverPanel } from '../shell/Shell';

export function OrderBook() {
  const { mid, bids, asks, ticks } = useStream(/* process.env.NEXT_PUBLIC_FLINK_WS */);
  const max = Math.max(...bids.map((l) => l.q), ...asks.map((l) => l.q));
  const row = (l: { p: number; q: number }, c: string) => (
    <div key={l.p} className="relative flex justify-between px-3 py-[2px] text-[11px]">
      <div className="absolute inset-y-0 right-0" style={{ width: `${(l.q / max) * 100}%`, background: c, opacity: 0.18 }} />
      <span style={{ color: c }}>{l.p.toFixed(2)}</span><span>{l.q}</span>
    </div>
  );
  const x = d3.scaleLinear([0, 239], [0, 300]);
  const y = d3.scaleLinear(d3.extent(ticks) as [number, number], [40, 2]);
  const path = ticks.length > 1 ? d3.line<number>().x((_, i) => x(i)).y((v) => y(v))(ticks) : '';
  return (
    <HoverPanel title="ES · ORDER BOOK" drawer={<><p className="text-[var(--cyan)] mb-2">Microstructure</p>
      <p>Spread {(asks[0].p - bids[0].p).toFixed(2)}</p>
      <p>Imbalance {(bids.reduce((a, l) => a + l.q, 0) / asks.reduce((a, l) => a + l.q, 0)).toFixed(2)}</p></>}>
      {[...asks].reverse().map((l) => row(l, 'var(--red)'))}
      <div className="px-3 py-2 text-lg text-[var(--cyan)] border-y border-[#23252e]">{mid.toFixed(2)}</div>
      {bids.map((l) => row(l, 'var(--green)'))}
      <svg viewBox="0 0 300 42" className="w-full"><path d={path ?? ''} fill="none" stroke="var(--cyan)" strokeWidth="1.2" /></svg>
    </HoverPanel>
  );
}

type Row = [string, number, number];
const SECTORS: Record<string, Row[]> = {
  Tech: [['AAPL', 3400, 1.2], ['MSFT', 3100, 0.8], ['NVDA', 2900, 3.1], ['GOOGL', 2100, -0.4]],
  Finance: [['JPM', 560, 0.3], ['V', 560, -0.6], ['BAC', 300, -1.1]],
  Energy: [['XOM', 480, -1.8], ['CVX', 290, -2.2]],
  Intl: [['TSM', 800, 2.4], ['ASML', 380, 1.5], ['NESN', 270, -0.3], ['7203.T', 300, 0.9]],
};
const DATA = { name: 'World', children: Object.entries(SECTORS).map(([name, rows]) => ({
  name, children: rows.map(([n, cap, chg]) => ({ name: n, cap, chg })) })) };

export function MarketTreemap() {
  const W = 800, H = 360;
  const leaves = useMemo(() => {
    const root = d3.hierarchy<any>(DATA).sum((d) => d.cap ?? 0);
    return d3.treemap<any>().size([W, H]).paddingInner(2).paddingOuter(2)(root).leaves();
  }, []);
  const color = d3.scaleLinear<string>().domain([-3, 0, 3]).range(['#ff3b5c', '#15151c', '#10f5a0']).clamp(true);
  return (
    <HoverPanel title="GLOBAL HEATMAP · SIZE = MARKET CAP · COLOUR = 1D %" drawer={<p className="text-[var(--cyan)]">Sector drill-down: breadth, factor tilt, 30d vol.</p>}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {leaves.map((n: any, i) => (
          <motion.g key={n.data.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
            <rect x={n.x0} y={n.y0} width={n.x1 - n.x0} height={n.y1 - n.y0} fill={color(n.data.chg)} fillOpacity={0.85} stroke="#23252e" />
            <text x={n.x0 + 6} y={n.y0 + 16} fontSize="11" fill="#fff">{n.data.name}</text>
            <text x={n.x0 + 6} y={n.y0 + 30} fontSize="10" fill="#ffffffaa">{n.data.chg > 0 ? '+' : ''}{n.data.chg}%</text>
          </motion.g>
        ))}
      </svg>
    </HoverPanel>
  );
}

function Gauge({ label, value, max, color, fmt }: { label: string; value: number; max: number; color: string; fmt: string }) {
  return (
    <div className="flex flex-col items-center p-4">
      <svg viewBox="0 0 120 70" className="w-40">
        <path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke="#23252e" strokeWidth="8" strokeLinecap="round" />
        <motion.path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          initial={{ pathLength: 0 }} animate={{ pathLength: value / max }} transition={{ duration: 1.2, ease: 'easeOut' }} />
        <text x="60" y="58" textAnchor="middle" fontSize="16" fill="#fff">{fmt}</text>
      </svg>
      <span className="text-[11px] text-[#7d8191]">{label}</span>
    </div>
  );
}

export function RiskHUD() {
  return (
    <HoverPanel title="PORTFOLIO RISK" drawer={<p className="text-[var(--cyan)]">Risk decomposition by factor and position.</p>}>
      <div className="grid grid-cols-1 sm:grid-cols-3">
        <Gauge label="Beta vs SPX" value={1.12} max={2} color="var(--purple)" fmt="1.12" />
        <Gauge label="Sharpe (1y)" value={1.84} max={3} color="var(--green)" fmt="1.84" />
        <Gauge label="1d VaR 95%" value={2.3} max={6} color="var(--red)" fmt="-2.3%" />
      </div>
    </HoverPanel>
  );
}
