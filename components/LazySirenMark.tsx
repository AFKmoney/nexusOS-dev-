import React from 'react';

type Variant = 'icon' | 'splash' | 'boot';

export default function LazySirenMark({
  variant = 'icon',
  className = '',
}: {
  variant?: Variant;
  className?: string;
}) {
  const compact = variant === 'icon';
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <style>{`
        @keyframes ls-dash { to { stroke-dashoffset: 0; } }
        @keyframes ls-breathe { 0%,100% { opacity:.55; transform:scale(1); } 50% { opacity:1; transform:scale(1.03); } }
        @keyframes ls-drift { 0% { transform:translate3d(0,0,0); } 50% { transform:translate3d(6px,-10px,0); } 100% { transform:translate3d(0,0,0); } }
        @keyframes ls-glow { 0%,100% { box-shadow:0 0 24px rgba(16,185,129,.18); } 50% { box-shadow:0 0 48px rgba(16,185,129,.4); } }
      `}</style>

      {!compact && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-accent"
              style={{
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                left: `${(i * 37) % 100}%`,
                top: `${(i * 19) % 100}%`,
                opacity: 0.15 + (i % 5) * 0.08,
                animation: `ls-drift ${6 + (i % 5)}s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`relative ${compact ? 'w-20 h-20 rounded-[1.4rem]' : 'w-44 sm:w-52 rounded-[2rem] px-6 py-8'} bg-[#0a0a0f]/80 border border-white/10 backdrop-blur-xl`}
        style={{ animation: 'ls-glow 3.6s ease-in-out infinite' }}
      >
        <svg viewBox="0 0 80 120" className={`${compact ? 'w-12 h-16 mx-auto' : 'w-20 h-28 mx-auto'} overflow-visible`}>
          <defs>
            <linearGradient id="lsStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="lsBlur">
              <feGaussianBlur stdDeviation="1.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M40 10 C40 10 52 28 28 42 C10 54 58 68 40 86 C28 98 48 108 40 116"
            fill="none"
            stroke="url(#lsStroke)"
            strokeWidth="3.2"
            strokeLinecap="round"
            filter="url(#lsBlur)"
            style={{
              strokeDasharray: 220,
              strokeDashoffset: 220,
              animation: 'ls-dash 1.8s ease-out forwards, ls-breathe 3.2s ease-in-out 1.8s infinite',
            }}
          />
        </svg>
        {variant !== 'icon' && (
          <div className="mt-3 text-center">
            <div className="text-[11px] sm:text-xs tracking-[0.38em] text-white font-semibold">LAZYSIREN</div>
          </div>
        )}
      </div>
    </div>
  );
}
