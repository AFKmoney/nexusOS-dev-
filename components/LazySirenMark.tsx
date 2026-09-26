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
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <style>{`
        @keyframes ls-dash { to { stroke-dashoffset: 0; } }
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
            d="M62 14 C78 22 78 40 58 48 C36 56 36 70 54 78 C68 84 72 90 64 94"
            stroke={`url(#ls-${uid})`}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 240,
              strokeDashoffset: 240,
              animation: 'ls-dash 1.4s ease-out forwards',
            }}
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
