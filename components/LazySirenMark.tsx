import React, { useEffect, useId, useState } from 'react';

type Variant = 'icon' | 'splash' | 'boot';

function sinePath(phase: number) {
  const steps = 48;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const y = 8 + u * 84;
    const x = 50 + Math.sin(u * Math.PI * 2 + phase) * 16;
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(' ');
}

export default function LazySirenMark({
  variant = 'icon',
  className = '',
}: {
  variant?: Variant;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const compact = variant === 'icon';
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.012;
      setPhase(t * 0.55);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <style>{`
        @keyframes ls-glow { 0%,100% { box-shadow: 0 0 0 1px rgba(16,185,129,.18), 0 0 40px rgba(16,185,129,.12); } 50% { box-shadow: 0 0 0 1px rgba(16,185,129,.4), 0 0 64px rgba(16,185,129,.28); } }
      `}</style>

      <div
        className={`relative flex items-center justify-center ${
          compact ? 'w-[72px] h-[72px] rounded-[22px]' : 'w-[168px] h-[168px] sm:w-[196px] sm:h-[196px] rounded-[36px]'
        } bg-[#07070c] border border-white/10`}
        style={{ animation: 'ls-glow 3.8s ease-in-out infinite' }}
      >
        <svg
          viewBox="0 0 100 100"
          className={compact ? 'w-10 h-10' : 'w-[92px] h-[92px] sm:w-[108px] sm:h-[108px]'}
          fill="none"
        >
          <defs>
            <linearGradient id={`ls-${uid}`} x1="20" y1="8" x2="80" y2="92">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <path
            d={sinePath(phase)}
            stroke={`url(#ls-${uid})`}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {variant !== 'icon' && (
        <div className="mt-6 text-center">
          <div className="text-[13px] sm:text-[15px] tracking-[0.42em] text-white font-medium">LAZYSIREN</div>
        </div>
      )}
    </div>
  );
}
