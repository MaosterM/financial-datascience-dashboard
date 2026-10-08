'use client';
export const Slider = ({ l, v, min, max, step = 1, on }: { l: string; v: number; min: number; max: number; step?: number; on: (n: number) => void }) => (
  <label className="block text-[11px] text-[#7d8191]">{l}: <b className="text-[var(--cyan)]">{v}</b>
    <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => on(+e.target.value)} className="w-full accent-[#22e5ff]" /></label>
);
export const Stat = ({ l, v, c = 'var(--cyan)' }: { l: string; v: string; c?: string }) => (
  <div className="p-3"><div className="text-[10px] text-[#7d8191]">{l}</div><div className="text-lg" style={{ color: c }}>{v}</div></div>
);
