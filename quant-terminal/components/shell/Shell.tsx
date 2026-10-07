'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';

const NAV = [['Command', '/'], ['Alpha', '/alpha'], ['Sentiment', '/sentiment'], ['Risk', '/risk']];

export function TopBar() {
  return (
    <motion.header initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      className="fixed top-3 inset-x-3 md:inset-x-5 z-50 rounded-lg border border-[#23252e] bg-[#0a0a0f99] backdrop-blur-xl">
      {/* health pulse: drive colour/period from a real market-breadth feed */}
      <motion.div className="absolute inset-0 rounded-lg pointer-events-none"
        animate={{ boxShadow: ['0 0 0 0 #10f5a000', '0 0 22px 0 #10f5a066', '0 0 0 0 #10f5a000'] }}
        transition={{ duration: 3, repeat: Infinity }} />
      <nav className="relative flex items-center gap-4 md:gap-8 px-4 h-12 text-xs">
        <span className="text-[var(--cyan)] font-bold tracking-widest">QUANT/HUD</span>
        {NAV.map(([n, h]) => <Link key={h} href={h} className="text-[#9aa0b2] hover:text-white transition-colors">{n}</Link>)}
        <span className="ml-auto text-[var(--green)]">● breadth 0.68</span>
      </nav>
    </motion.header>
  );
}

const TICKS = ['SPX 5,240 +0.4%', 'NDX 18,410 +0.7%', 'VIX 14.2 -3.1%', 'BTC 67,200 +1.9%', 'XAU 2,330 -0.2%', 'EURUSD 1.082 +0.1%', 'US10Y 4.21 +2bp'];

export function BottomBar() {
  return (
    <motion.footer initial={{ y: 60 }} animate={{ y: 0 }} transition={{ delay: 0.5, type: 'spring', damping: 20 }}
      className="fixed bottom-0 inset-x-0 z-50 h-10 border-t border-[#23252e] bg-[#050507cc] backdrop-blur-xl flex items-center text-[11px]">
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-10 w-max" style={{ animation: 'tape 40s linear infinite' }}>
          {[...TICKS, ...TICKS].map((t, i) => <span key={i} className={t.includes('-') ? 'text-[var(--red)]' : 'text-[var(--green)]'}>{t}</span>)}
        </div>
      </div>
      <span className="px-4 text-[var(--cyan)] whitespace-nowrap">● feed live · 12ms</span>
    </motion.footer>
  );
}

/** Panel that slides a translucent drawer out on hover, no click needed. */
export function HoverPanel({ title, drawer, children }: { title: string; drawer: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel h-full" data-active={open} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className="ttl">{title}</div>
      {children}
      <AnimatePresence>
        {open && (
          <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="absolute right-0 top-0 h-full w-[46%] max-w-xs p-4 text-xs border-l border-[var(--cyan)] bg-[#050507d9] backdrop-blur-md">
            {drawer}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
