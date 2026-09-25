import React from 'react';
import { useOS } from '../store/osStore';
import { Home, Layers, LayoutGrid, SlidersHorizontal, Smartphone, Monitor } from 'lucide-react';

interface MobileNavBarProps {
  onToggleAppSwitcher: () => void;
  onToggleControlCenter: () => void;
  onGoHome: () => void;
  isAppSwitcherOpen?: boolean;
  isControlCenterOpen?: boolean;
  isHomeScreenActive?: boolean;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  onToggleAppSwitcher,
  onToggleControlCenter,
  onGoHome,
  isAppSwitcherOpen = false,
  isControlCenterOpen = false,
  isHomeScreenActive = true,
}) => {
  const { windows, mobileMode, setMobileMode } = useOS();

  const openWindowsCount = windows.filter(w => !w.isMinimized).length;
  const totalOpenWindows = windows.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#07070a]/95 backdrop-blur-3xl border-t border-white/10 select-none pb-safe">
      <div className="h-14 px-3 flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Accueil (Home) */}
        <button
          onClick={onGoHome}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            isHomeScreenActive && !isAppSwitcherOpen && !isControlCenterOpen
              ? 'text-accent font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Accueil"
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isHomeScreenActive && !isAppSwitcherOpen && !isControlCenterOpen
                ? 'bg-accent/20 ring-1 ring-accent/30'
                : 'bg-transparent'
            }`}
          >
            <Home size={20} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Accueil</span>
        </button>

        {/* 2. Multitâche (App Switcher) */}
        <button
          onClick={onToggleAppSwitcher}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            isAppSwitcherOpen ? 'text-accent font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Multitâche"
        >
          <div
            className={`p-1 rounded-xl relative transition-all ${
              isAppSwitcherOpen ? 'bg-accent/20 ring-1 ring-accent/30' : 'bg-transparent'
            }`}
          >
            <Layers size={20} />
            {totalOpenWindows > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-black font-black text-[9px] flex items-center justify-center shadow-md">
                {totalOpenWindows}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Multitâche</span>
        </button>

        {/* 3. Mode Toggle (Mobile / Desktop) */}
        <button
          onClick={() => {
            const next = mobileMode === 'desktop' ? 'auto' : 'desktop';
            setMobileMode(next);
          }}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-zinc-400 hover:text-zinc-200 transition-all active:scale-90"
          title="Basculer vers le mode Bureau"
          aria-label="Mode Bureau"
        >
          <div className="p-1 rounded-xl bg-white/5 border border-white/5">
            <Monitor size={18} className="text-zinc-400" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Bureau</span>
        </button>

        {/* 4. Centre de Contrôle / Paramètres rapides */}
        <button
          onClick={onToggleControlCenter}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            isControlCenterOpen ? 'text-accent font-bold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Centre de Contrôle"
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isControlCenterOpen ? 'bg-accent/20 ring-1 ring-accent/30' : 'bg-transparent'
            }`}
          >
            <SlidersHorizontal size={20} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Contrôle</span>
        </button>
      </div>

      {/* iOS-style gesture indicator pill bar */}
      <div
        onClick={onGoHome}
        className="w-32 h-1 bg-white/30 hover:bg-white/50 active:bg-accent rounded-full mx-auto mb-1.5 transition-all cursor-pointer"
        title="Appuyez pour revenir à l'accueil"
      />
    </nav>
  );
};

export default MobileNavBar;
