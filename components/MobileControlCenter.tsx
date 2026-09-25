import React from 'react';
import { useOS } from '../store/osStore';
import { useSystemControls } from '../hooks/useSystemControls';
import {
  Volume2,
  VolumeX,
  Sun,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Zap,
  Lock,
  LogOut,
  Palette,
  X,
  User,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { themeEngine } from '../kernel/themeEngine';

interface MobileControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_PRESETS = [
  { name: 'Émeraude', color: '#10b981' },
  { name: 'Ambre', color: '#f59e0b' },
  { name: 'Bleu', color: '#3b82f6' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Violet', color: '#8b5cf6' },
  { name: 'Zinc', color: '#71717a' },
];

export const MobileControlCenter: React.FC<MobileControlCenterProps> = ({ isOpen, onClose }) => {
  const {
    mobileMode,
    setMobileMode,
    accentColor,
    setAccentColor,
    kernelRules,
    updateKernelRules,
    lockShell,
    logout,
    currentUser,
    openWindow,
    addNotification,
  } = useOS();

  const {
    volume,
    setVolume,
    isMuted,
    toggleMute,
    brightness,
    setBrightness,
    isOnline,
  } = useSystemControls();

  if (!isOpen) return null;

  const handleSelectAccent = (color: string, name: string) => {
    setAccentColor(color);
    themeEngine.setCustomAccent(color);
    themeEngine.apply();
    addNotification({
      title: 'Thème mis à jour',
      message: `Couleur d'accentuation: ${name}`,
      type: 'info',
    });
  };

  return (
    <div
      className="fixed inset-0 z-[9996] bg-black/60 backdrop-blur-md flex flex-col justify-end select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto bg-[#0a0a0f]/98 backdrop-blur-3xl border-t border-x border-white/15 rounded-t-3xl p-5 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-8 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        {/* Title bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-accent/15 text-accent">
              <Zap size={16} />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Centre de Contrôle
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Sliders: Volume & Brightness */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Volume */}
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-300"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={15} className="text-rose-400" />
                  ) : (
                    <Volume2 size={15} className="text-accent" />
                  )}
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Son
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-300">
                {isMuted ? 'Muet' : `${volume}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full h-1.5 bg-black/60 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Brightness */}
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sun size={15} className="text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Luminosité
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-300">
                {brightness}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="w-full h-1.5 bg-black/60 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>

        {/* Quick Toggles Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {/* Mode Switcher */}
          <button
            onClick={() => {
              const next = mobileMode === 'mobile' ? 'desktop' : 'mobile';
              setMobileMode(next);
            }}
            className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              mobileMode === 'mobile'
                ? 'bg-accent/15 border-accent/30 text-white'
                : 'bg-white/5 border-white/10 text-zinc-300'
            }`}
          >
            <div className="p-2 rounded-xl bg-white/10 text-accent">
              <Smartphone size={16} />
            </div>
            <div>
              <div className="text-xs font-bold">Mode Mobile</div>
              <div className="text-[10px] text-zinc-400">
                {mobileMode === 'mobile' ? 'Actif (optimisé)' : 'Désactivé'}
              </div>
            </div>
          </button>

          {/* Autonomie IA / Engine */}
          <button
            onClick={() => {
              updateKernelRules({ autonomyEnabled: !kernelRules.autonomyEnabled });
            }}
            className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              kernelRules.autonomyEnabled
                ? 'bg-accent/15 border-accent/30 text-white'
                : 'bg-white/5 border-white/10 text-zinc-300'
            }`}
          >
            <div className="p-2 rounded-xl bg-white/10 text-accent">
              <Zap size={16} />
            </div>
            <div>
              <div className="text-xs font-bold">Moteur IA</div>
              <div className="text-[10px] text-zinc-400">
                {kernelRules.autonomyEnabled ? 'Autonome ON' : 'Veille'}
              </div>
            </div>
          </button>
        </div>

        {/* Accent Color Palette */}
        <div className="mb-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Palette size={13} className="text-zinc-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Couleur d'accentuation
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.color}
                onClick={() => handleSelectAccent(preset.color, preset.name)}
                style={{ backgroundColor: preset.color }}
                className={`w-8 h-8 rounded-full transition-transform active:scale-90 flex items-center justify-center ${
                  accentColor === preset.color
                    ? 'ring-4 ring-white/30 scale-110 shadow-lg'
                    : 'opacity-80 hover:opacity-100'
                }`}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* User Profile & Lock / Exit */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-sm">
              {currentUser?.name?.[0] || 'U'}
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {currentUser?.name || 'Utilisateur'}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">
                Session Active
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                openWindow('settings');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-bold transition-all"
            >
              Réglages
            </button>

            <button
              onClick={() => {
                onClose();
                lockShell();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 transition-all"
              title="Verrouiller"
            >
              <Lock size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileControlCenter;
