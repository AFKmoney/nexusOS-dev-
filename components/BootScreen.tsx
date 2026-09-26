import React, { useEffect, useState } from 'react';
import { useOS } from '../store/osStore';
import { sounds } from '../kernel/sounds';
import LazySirenMark from './LazySirenMark';
import BiosScreen from './BiosScreen';

const BEATS = [
  'kernel',
  'vfs',
  'daemon',
  'ready',
];

export default function BootScreen() {
  const { setBooted } = useOS();
  const [beat, setBeat] = useState(0);
  const [showBios, setShowBios] = useState(false);
  const progress = Math.min(100, ((beat + 1) / BEATS.length) * 100);

  useEffect(() => {
    const force = setTimeout(() => {
      if (!useOS.getState().booted) setBooted(true);
    }, 2600);
    return () => clearTimeout(force);
  }, [setBooted]);

  useEffect(() => {
    if (beat < BEATS.length - 1) {
      const t = setTimeout(() => setBeat(b => b + 1), 520);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      try { sounds.boot(); } catch { /* webview audio lock */ }
      setBooted(true);
    }, 480);
    return () => clearTimeout(t);
  }, [beat, setBooted]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') setShowBios(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#050508', width: '100vw', height: '100vh' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 42%, rgba(16,185,129,0.16) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-6">
        <LazySirenMark variant="boot" />
        <div className="mt-10 w-40 h-[2px] rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 text-[10px] tracking-[0.35em] uppercase text-emerald-400/80 font-medium">
          {BEATS[beat]}
        </div>
      </div>

      <div className="absolute bottom-7 text-[9px] tracking-[0.28em] text-white/20 uppercase">
        F2 bios
      </div>

      {showBios && <BiosScreen onExit={() => setShowBios(false)} />}
    </div>
  );
}
