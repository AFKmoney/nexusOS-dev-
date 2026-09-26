import React, { useId } from 'react';

type Variant = 'icon' | 'splash' | 'boot';

export default function LazySirenMark({
  variant = 'icon',
  className = '',
}: {
  variant?: Variant;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const compact = variant === 'icon';
  const dots = compact ? 0 : 16;
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <style>{`
        @keyframes ls-dash { to { stroke-dashoffset: 0; } }
        @keyframes ls-breathe { 0%,100% { opacity:.7 } 50% { opacity:1 } }
        @keyframes ls-drift { 0%,100% { transform:translate(0,0) } 50% { transform:translate(4px,-8px) } }
        @keyframes ls-glow { 0%,100% { box-shadow:0 0 20px rgba(16,185,129,.16) } 50% { box-shadow:0 0 36px rgba(16,185,129,.35) } }
      `}</style>

      {dots > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: dots }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-emerald-400"
              style={{
                width: 2,
                height: 2,
                left: `${(i * 37) % 100}%`,
                top: `${(i * 19) % 100}%`,
                opacity: 0.25,
                animation: `ls-drift ${6 + (i % 4)}s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`relative ${compact ? 'w-20 h-20 rounded-[1.4rem]' : 'w-44 sm:w-52 rounded-[2rem] px-6 py-8'} bg-[#0a0a0f]/80 border border-white/10`}
        style={{ animation: 'ls-glow 3.6s ease-in-out infinite' }}
      >
        <svg viewBox="0 0 80 120" className={`${compact ? 'w-12 h-16 mx-auto' : 'w-20 h-28 mx-auto'}`}>
          <defs>
            <linearGradient id={`lsStroke-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path
            d="M40 10 C40 10 52 28 28 42 C10 54 58 68 40 86 C28 98 48 108 40 116"
            fill="none"
            stroke={`url(#lsStroke-${uid})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            style={{
              strokeDasharray: 220,
              strokeDashoffset: 220,
              animation: 'ls-dash 1.6s ease-out forwards, ls-breathe 3s ease-in-out 1.6s infinite',
            }}
          />
        </svg>
        {variant !== 'icon' && (
          <div className="mt-3 text-center text-[11px] sm:text-xs tracking-[0.38em] text-white font-semibold">
            LAZYSIREN
          </div>
        )}
      </div>
    </div>
  );
}
