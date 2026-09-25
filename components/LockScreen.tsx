import React, { useEffect, useState, useRef } from 'react';
import { Lock, Shield, Cpu, Sparkles, Fingerprint, ChevronUp, Terminal } from 'lucide-react';
import { sounds } from '../kernel/sounds';

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [time, setTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    sounds.lock();
    const t = setInterval(() => setTime(new Date()), 1000);
    
    // Allow keyboard unlock (Space, Enter, Escape)
    const handleKey = (e: KeyboardEvent) => {
      if (['Space', 'Enter', 'Escape'].includes(e.code) || e.key === ' ') {
        e.preventDefault();
        triggerUnlock();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearInterval(t);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const triggerUnlock = () => {
    sounds.click();
    onUnlock();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const deltaY = touchStartY.current - (e.touches[0]?.clientY ?? 0);
      if (deltaY > 0) {
        setSwipeOffset(Math.min(100, deltaY));
      }
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 40) {
      triggerUnlock();
    } else {
      setSwipeOffset(0);
    }
    touchStartY.current = null;
  };

  const hours = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div 
      className="fixed inset-0 z-[9998] bg-[#030306] select-none flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden cursor-pointer"
      onClick={triggerUnlock}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: swipeOffset > 0 ? `translateY(-${swipeOffset}px)` : undefined,
        transition: swipeOffset === 0 ? 'transform 0.25s ease-out' : 'none'
      }}
    >
      {/* Background Cyber Glow & Scanlines */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Subtle Matrix/HUD Grid lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Top Bar: Authenticated Daemon Kernel Badge */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase font-bold">
            DAEMON Core // ENCRYPTED LOCK
          </span>
        </div>

        <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-mono">
          <span className="hidden sm:inline">SHA-256 [0x7f4a...9c21]</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase">
            VERIFIED
          </span>
        </div>
      </div>

      {/* Center Digital Clock HUD */}
      <div className="flex flex-col items-center my-auto z-10 text-center">
        {/* Lock Icon Pulsing */}
        <div className="mb-6 p-4 rounded-3xl bg-accent/10 border border-accent/25 backdrop-blur-xl shadow-lg shadow-accent/10 relative group">
          <div className="absolute -inset-1 rounded-3xl bg-accent/20 blur opacity-60 animate-pulse" />
          <Lock size={28} className="text-accent relative z-10" />
        </div>

        {/* Time with Seconds HUD */}
        <div className="flex items-baseline justify-center font-extralight tracking-tight text-white mb-2 font-mono">
          <span className="text-6xl sm:text-8xl md:text-9xl font-sans font-thin tracking-wider drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
            {hours}
          </span>
          <span className="text-xl sm:text-2xl font-mono text-accent/80 ml-2 font-light">
            :{seconds}
          </span>
        </div>

        {/* Formatted Date */}
        <div className="text-sm sm:text-base text-zinc-400 tracking-wide font-light mb-4">
          {dateStr}
        </div>

        {/* System Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-400">
          <Cpu size={12} className="text-accent" />
          <span>Kernel Subsystem Active</span>
          <span className="text-zinc-600">·</span>
          <span className="text-emerald-400">0.02% Load</span>
        </div>
      </div>

      {/* Bottom Unlock Interaction Banner */}
      <div 
        className="w-full max-w-sm flex flex-col items-center gap-3 z-10 pb-4 transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-3.5 rounded-full bg-white/5 border border-white/10 hover:border-accent/40 text-zinc-300 hover:text-white transition-all shadow-lg active:scale-95 group">
          <Fingerprint size={28} className="text-zinc-400 group-hover:text-accent transition-colors" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium tracking-widest uppercase text-zinc-300">
            <ChevronUp size={14} className="text-accent animate-bounce" />
            <span>Tap, click or swipe up to unlock</span>
          </div>
          <span className="text-[10px] text-zinc-600 font-mono tracking-wider">
            Press Space / Enter to Authenticate
          </span>
        </div>
      </div>
    </div>
  );
}
