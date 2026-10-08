'use client';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { HoverPanel } from '@/components/shell/Shell';

type N = d3.SimulationNodeDatum & { id: string; f: number; s: number };
const IDS = ['Fed', 'ECB', 'CPI', 'NVDA', 'AAPL', 'BTC', 'Oil', 'Gold', 'China', 'Tesla'];
const LINKS: [number, number][] = [[0, 2], [0, 3], [1, 2], [2, 7], [3, 4], [3, 5], [5, 0], [6, 8], [6, 2], [8, 9], [9, 4], [7, 0]];
const mix = d3.interpolateRgb('#ff3b5c', '#10f5a0');

function Network() {
  const nodes = useRef<N[]>(IDS.map((id, i) => ({ id, f: 20 + ((i * 17) % 40), s: ((i * 37) % 200) / 100 - 1 })));
  const [, tick] = useState(0);
  useEffect(() => {
    const sim = d3.forceSimulation(nodes.current)
      .force('l', d3.forceLink(LINKS.map(([source, target]) => ({ source, target }))).distance(90))
      .force('c', d3.forceManyBody().strength(-260)).force('m', d3.forceCenter(300, 190)).force('x', d3.forceCollide(28))
      .on('tick', () => tick((n) => n + 1));
    const id = setInterval(() => {
      nodes.current.forEach((n) => { n.s = Math.max(-1, Math.min(1, n.s + (Math.random() - 0.5) * 0.3)); n.f = Math.max(10, Math.min(70, n.f + (Math.random() - 0.5) * 6)); });
      tick((n) => n + 1);
    }, 1500);
    return () => { sim.stop(); clearInterval(id); };
  }, []);
  const N = nodes.current;
  return (
    <HoverPanel title="ENTITY SENTIMENT NETWORK · SIZE = MENTIONS · COLOUR = BULL/BEAR (SIMULATED FEED)" drawer={<><p className="text-[var(--cyan)] mb-2">Scores</p>{N.map((n) => <p key={n.id}>{n.id} {n.s.toFixed(2)}</p>)}</>}>
      <svg viewBox="0 0 600 380" className="w-full">
        {LINKS.map(([a, b], i) => <line key={i} x1={N[a].x ?? 300} y1={N[a].y ?? 190} x2={N[b].x ?? 300} y2={N[b].y ?? 190} stroke="#2a2d38" />)}
        {N.map((n) => <g key={n.id}><circle cx={n.x ?? 300} cy={n.y ?? 190} r={8 + n.f / 3} fill={mix((n.s + 1) / 2)} fillOpacity=".8" stroke="#fff" strokeOpacity=".3" style={{ transition: 'fill 1s' }} />
          <text x={n.x ?? 300} y={(n.y ?? 190) + 3} fontSize="9" textAnchor="middle" fill="#050507">{n.id}</text></g>)}
      </svg>
    </HoverPanel>
  );
}

const EV: [string, string, string, number][] = [
  ['T-30d', 'Central bank holds rates, hawkish tone', 'USD/JPY', -0.8], ['T-21d', 'Inflation print cools vs forecast', 'EUR/USD', 0.6],
  ['T-14d', 'Rate cut of 25bp announced', 'EUR/USD', -0.7], ['T-7d', 'Geopolitical shock lifts oil', 'USD/CAD', 0.4], ['T-2d', 'Hint of faster policy tightening', 'USD/JPY', -1.2],
];
function Timeline() {
  return (
    <HoverPanel title="MACRO EVENT TIMELINE · ILLUSTRATIVE SAMPLE DATA" drawer={<p className="text-[var(--cyan)]">Wire a calendar API and map each release to FX returns.</p>}>
      <div className="relative p-4 pl-8">
        <div className="absolute left-4 top-4 bottom-4 w-px bg-[#23252e]" />
        {EV.map(([d, t, pair, imp], i) => { const c = imp > 0 ? 'var(--green)' : 'var(--red)'; return (
          <motion.div key={t} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative mb-5 text-xs">
            <span className="absolute -left-[22px] top-1 w-2 h-2 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
            <div className="text-[#7d8191]">{d}</div><div>{t}</div>
            <div className="mt-1 flex items-center gap-2"><span className="text-[var(--cyan)]">{pair}</span><div className="h-1.5" style={{ width: Math.abs(imp) * 60, background: c }} /><span>{imp > 0 ? '+' : ''}{imp}%</span></div>
          </motion.div>); })}
      </div>
    </HoverPanel>
  );
}

export default function Sentiment() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      <div className="lg:col-span-7"><Network /></div><div className="lg:col-span-5"><Timeline /></div>
    </div>
  );
}
