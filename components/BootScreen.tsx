import React, { useEffect, useState } from 'react';
import { useOS } from '../store/osStore';
import { sounds } from '../kernel/sounds';
import LazySirenMark from './LazySirenMark';
import BiosScreen from './BiosScreen';

const BOOT_MESSAGES = [
  'DAEMON Core initializing...',
  'Loading kernel: VFS, Memory, EventBus, IPC',
  'ProcessManager → started',
  'FileSystem → /home mounted',
  'ErrorGuard → 5-layer validation active',
  'ToolForge v2 → 65+ native actions loaded',
  'SkillForge v2 → AI self-evolution engine ready',
  'SkillSandbox → Web Worker isolation active',
  'AutoPilot → goal queue + self-prompting ready',
  'AgentOrchestrator v2 → parallel multi-agent ready',
  'AppGenerator → full-filesystem app generation ready',
  'HyperIDE → multi-file project support ready',
  'EpisodicMemory → conversation recall ready',
  'Function Calling → native tool-use enabled',
  'PolicyEngine v1.1 → Full Autonomy mode ready',
  'Neural Spine → manifest snapshot compiled',
  'ThemeEngine → accent applied',
  'PermissionSystem → sandbox enforced',
  'DAEMON.CORE → Link check initiated',
];

export default function BootScreen() {
  const { setBooted } = useOS();
  const [bootPhase, setBootPhase] = useState(0);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [showBios, setShowBios] = useState(false);

  useEffect(() => {
    const force = setTimeout(() => {
      if (!useOS.getState().booted) setBooted(true);
    }, 2500);
    return () => clearTimeout(force);
  }, [setBooted]);

  useEffect(() => {
    if (bootPhase < BOOT_MESSAGES.length) {
      const t = setTimeout(() => {
        const nextMessage = BOOT_MESSAGES[bootPhase];
        if (nextMessage) {
          setBootLines(prev => [...prev, nextMessage]);
        }
        setBootPhase(p => p + 1);
        setProgress(((bootPhase + 1) / BOOT_MESSAGES.length) * 100);
      }, 120 + Math.random() * 80);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      try { sounds.boot(); } catch { /* webview audio lock */ }
      setBooted(true);
      setTimeout(() => {
        try {
          useOS.getState().addNotification({
            title: 'LazySiren',
            message: 'System ready. All modules loaded.',
            type: 'success'
          });
        } catch { /* store not ready */ }
      }, 800);
    }, 400);

    return () => clearTimeout(t);
  }, [bootPhase, setBooted]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') setShowBios(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono relative overflow-hidden" style={{ backgroundColor: '#000', width: '100vw', height: '100vh' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16,185,129,0.03) 2px, rgba(16,185,129,0.03) 4px)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 60%)',
      }} />

      <div className="relative mb-8 w-full flex flex-col items-center">
        <LazySirenMark variant="boot" className="w-64 h-56 mb-2" />
        <div className="text-zinc-600 text-[10px] text-center tracking-[0.32em] uppercase">kernel · nexus drawer stays</div>
      </div>

      <div className="w-full max-w-xs px-6 mb-6">
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-300 shadow-accent" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="w-80 h-44 overflow-hidden">
        {bootLines.map((line, i) => (
          <div key={i} className="text-[10px] font-mono text-accent/60 mb-0.5" style={{
            animation: 'fadeIn 0.2s ease-out',
            opacity: i === bootLines.length - 1 ? 1 : 0.5,
          }}>
            <span className="text-accent mr-1.5">▸</span>{line}
          </div>
        ))}
        {bootPhase < BOOT_MESSAGES.length && (
          <div className="text-[10px] text-accent animate-pulse mt-1">▋</div>
        )}
        {bootPhase >= BOOT_MESSAGES.length && (
          <div className="text-[11px] text-accent font-bold mt-2 animate-pulse tracking-widest">
            ⚡ BOOTING...
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-[9px] text-zinc-800 font-mono tracking-widest">
        DAEMON.CORE v3.0 · F2 for BIOS
      </div>

      {showBios && <BiosScreen onExit={() => setShowBios(false)} />}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
