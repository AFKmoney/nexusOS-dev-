import React from 'react';
import { Users, Lock } from 'lucide-react';
import LazySirenMark from './LazySirenMark';

type LoginScreenProps = {
  profiles: Array<{
    id: string;
    name: string;
    themeColor: string;
    isAdmin?: boolean;
  }>;
  login: (profileId: string) => void;
};

export default function LoginScreen({
  profiles,
  login
}: LoginScreenProps) {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans" style={{ backgroundColor: '#050505', color: 'white' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(6,95,70,0.08) 0%, transparent 50%)',
      }} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/80" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.01) 3px, rgba(255,255,255,0.01) 4px)',
      }} />

      <div className="z-10 flex flex-col items-center">
        <LazySirenMark variant="icon" className="mb-6" />
        <h1 className="text-3xl font-extralight text-white tracking-[0.25em] uppercase mb-2 drop-shadow-lg" style={{ color: 'white' }}>LAZYSIREN</h1>
        <div className="text-xs text-zinc-600 tracking-[0.2em] uppercase mb-12">Select Profile</div>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 px-4 max-w-sm sm:max-w-none">
          {profiles.map(p => (
            <div
              key={p.id}
              onClick={() => login(p.id)}
              className="flex flex-col items-center gap-3 sm:gap-4 cursor-pointer group p-2 rounded-2xl active:scale-95 transition-transform"
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-xl backdrop-blur-md border border-white/10 group-hover:border-accent/40 group-hover:shadow-accent"
                style={{ backgroundColor: `${p.themeColor}20`, color: p.themeColor }}
              >
                <Users size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div className="text-center">
                <div className="text-white font-medium text-sm sm:text-base tracking-wide group-hover:text-emerald-300 transition-colors drop-shadow-md">{p.name}</div>
                {p.isAdmin && <div className="text-[9px] sm:text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-0.5 sm:mt-1">Administrator</div>}
                {p.id === 'daemon' && <div className="text-[9px] sm:text-[10px] text-accent font-bold tracking-widest uppercase mt-0.5 sm:mt-1 animate-pulse">DAEMON AI</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-[10px] font-mono text-zinc-500 tracking-widest flex items-center gap-2">
          <Lock size={10} /> ENCRYPTED BOOT · <span className="text-accent">VERIFIED</span>
        </div>
      </div>
    </div>
  );
}