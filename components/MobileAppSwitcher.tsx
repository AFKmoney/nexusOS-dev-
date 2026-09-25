import React from 'react';
import { useOS } from '../store/osStore';
import { X, Trash2, Box, ArrowRight, Layers } from 'lucide-react';
import { sounds } from '../kernel/sounds';

interface MobileAppSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppSwitcher: React.FC<MobileAppSwitcherProps> = ({ isOpen, onClose }) => {
  const { windows, activeWindowId, focusWindow, closeWindow, registry, minimizeWindow } = useOS();

  if (!isOpen) return null;

  const handleSelectWindow = (id: string) => {
    sounds.windowFocus?.();
    focusWindow(id);
    onClose();
  };

  const handleCloseWindow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    sounds.windowClose?.();
    closeWindow(id);
  };

  const handleCloseAll = () => {
    sounds.windowClose?.();
    [...windows].forEach(w => closeWindow(w.id));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9995] bg-black/80 backdrop-blur-2xl flex flex-col p-4 pt-12 pb-20 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header */}
      <div
        className="flex items-center justify-between mb-4 px-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-accent/20 text-accent">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Multitâche
            </h2>
            <p className="text-[10px] text-zinc-400">
              {windows.length} application{windows.length > 1 ? 's' : ''} en cours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {windows.length > 0 && (
            <button
              onClick={handleCloseAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold active:scale-95 transition-all"
            >
              <Trash2 size={13} />
              <span>Tout fermer</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 active:scale-95 transition-all"
            aria-label="Fermer le multitâche"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Cards Area */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-1 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {windows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-3 shadow-inner">
              <Layers size={28} />
            </div>
            <h3 className="text-sm font-bold text-zinc-300 mb-1">
              Aucune application ouverte
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs mb-5">
              Lancez des applications depuis l'écran d'accueil pour les retrouver ici en multitâche.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-accent text-black font-black text-xs tracking-wider uppercase active:scale-95 transition-all shadow-accent"
            >
              Retour à l'accueil
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-md mx-auto">
            {windows.map((win) => {
              const app = registry.find((a) => a.id === win.appId);
              const Icon = app?.icon || Box;
              const isActive = activeWindowId === win.id && !win.isMinimized;

              return (
                <div
                  key={win.id}
                  onClick={() => handleSelectWindow(win.id)}
                  className={`relative flex flex-col rounded-2xl p-3 border transition-all duration-200 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-zinc-900/90 border-accent/60 shadow-[0_8px_30px_rgba(16,185,129,0.2)] ring-1 ring-accent/30'
                      : 'bg-zinc-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Card Title & Close */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-white/10 text-accent shrink-0">
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-bold text-zinc-100 truncate">
                        {win.title}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleCloseWindow(e, win.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 active:scale-90 transition-all"
                      title="Fermer"
                      aria-label="Fermer l'application"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Card Mock Preview */}
                  <div className="h-28 w-full rounded-xl bg-black/50 border border-white/5 flex flex-col items-center justify-center p-3 relative overflow-hidden group">
                    <Icon size={32} className="text-zinc-600 group-hover:text-accent transition-colors" />
                    <span className="text-[10px] text-zinc-500 mt-2 font-mono">
                      {win.appId}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 right-2 text-[9px] font-bold text-accent px-2 py-0.5 rounded-md bg-accent/15 border border-accent/20">
                      Basculer →
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAppSwitcher;
