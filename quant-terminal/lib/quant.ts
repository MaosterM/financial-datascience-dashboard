export const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
/** Deterministic GBM series (same on server and client, so no hydration mismatch). */
export const prices = (n: number, seed = 7, s0 = 100, mu = 0.0004, sg = 0.012) => { const r = rng(seed), a = [s0]; for (let i = 1; i < n; i++) a.push(a[i - 1] * Math.exp(mu + sg * gauss(r))); return a; };
export const pth = (v: number[], X: (i: number) => string, Y: (v: number) => string, o = 0) => v.map((y, i) => `${i ? 'L' : 'M'}${X(i + o)},${Y(y)}`).join('');
