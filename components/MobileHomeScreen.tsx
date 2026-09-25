import React, { useState, useMemo } from 'react';
import { useOS } from '../store/osStore';
import { sounds } from '../kernel/sounds';
import {
  Search,
  X,
  Sparkles,
  CloudSun,
  Star,
  Layers,
  Wrench,
  Palette,
  Cpu,
  Compass,
  Folder,
  Terminal,
  Settings,
  Globe,
  Bot,
  Box,
} from 'lucide-react';
import { useParallax3DS } from '../hooks/useParallax3DS';

interface MobileHomeScreenProps {
  onOpenApp: (appId: string) => void;
}

type CategoryType = 'favorites' | 'all' | 'productivity' | 'media' | 'system';

export const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({ onOpenApp }) => {
  const { registry, installedApps, windows } = useOS();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('favorites');
  const [searchQuery, setSearchQuery] = useState('');
  const { iconOffsetX, iconOffsetY } = useParallax3DS();

  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Primary curated favorites for mobile (essential daily apps)
  const FAVORITE_APP_IDS = [
    'explorer',
    'netrunner',
    'aion_agent',
    'calculator',
    'notepad',
    'appstore',
    'settings',
    'weather',
    'calendar',
    'music',
    'terminal',
    'dashboard',
  ];

  const CATEGORY_MAP: Record<CategoryType, { label: string; icon: any; filter: (appId: string) => boolean }> = {
    favorites: {
      label: 'Favoris',
      icon: Star,
      filter: (id) => FAVORITE_APP_IDS.includes(id),
    },
    all: {
      label: 'Tout',
      icon: Layers,
      filter: () => true,
    },
    productivity: {
      label: 'Productivité',
      icon: Wrench,
      filter: (id) =>
        ['notepad', 'explorer', 'calculator', 'calendar', 'rich_editor', 'kanban', 'pomodoro', 'habits', 'contacts', 'markdown'].includes(id),
    },
    media: {
      label: 'Multimédia',
      icon: Palette,
      filter: (id) =>
        ['music', 'paint', 'image_viewer', 'video_player', 'wallpaper', 'fractal', 'rss'].includes(id),
    },
    system: {
      label: 'Système & IA',
      icon: Cpu,
      filter: (id) =>
        ['settings', 'dashboard', 'monitor', 'task_manager', 'aion_agent', 'daemon_chat', 'forge', 'model_manager', 'terminal', 'ubuntu'].includes(id),
    },
  };

  // Filtered apps based on search query or active category
  const filteredApps = useMemo(() => {
    return registry.filter((app) => {
      if (!installedApps.includes(app.id)) return false;
      if (app.hidden) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          app.name.toLowerCase().includes(query) ||
          app.id.toLowerCase().includes(query) ||
          (app.description && app.description.toLowerCase().includes(query))
        );
      }

      return CATEGORY_MAP[activeCategory].filter(app.id);
    });
  }, [registry, installedApps, searchQuery, activeCategory]);

  const handleLaunch = (appId: string) => {
    sounds.windowOpen?.();
    onOpenApp(appId);
  };

  const isRunning = (appId: string) => {
    return windows.some((w) => w.appId === appId);
  };

  return (
    <div
      className="absolute inset-0 pt-11 pb-20 px-3.5 flex flex-col overflow-y-auto no-scrollbar select-none z-10"
      style={{
        transform: `translate3d(${iconOffsetX * 0.7}px, ${iconOffsetY * 0.7}px, 0)`,
        transition: 'transform 0.08s ease-out',
        willChange: 'transform',
      }}
    >
      {/* 1. Top Glance & Weather Widget */}
      <div className="pt-2 pb-3 px-1 flex items-center justify-between">
        <div>
          <div className="text-3xl sm:text-4xl font-light tracking-tight text-white/95 drop-shadow-md tabular-nums">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs font-semibold text-accent/90 drop-shadow-sm tracking-wide mt-0.5">
            {currentTime.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
        </div>

        {/* Weather Mini-Card */}
        <div
          onClick={() => handleLaunch('weather')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <CloudSun size={20} className="text-amber-400 shrink-0" />
          <div className="text-right">
            <div className="text-xs font-bold text-white">21°C</div>
            <div className="text-[9px] text-zinc-400 font-medium">Paris • Beau</div>
          </div>
        </div>
      </div>

      {/* 2. Fast Instant Search & Filter Bar */}
      <div className="mb-3 relative">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Recherche instantanée d'applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-8 bg-black/45 backdrop-blur-xl border border-white/12 rounded-xl text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-accent/60 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      {!searchQuery && (
        <div className="flex items-center gap-1.5 pb-3 overflow-x-auto no-scrollbar shrink-0">
          {(Object.keys(CATEGORY_MAP) as CategoryType[]).map((cat) => {
            const item = CATEGORY_MAP[cat];
            const Icon = item.icon;
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-tight whitespace-nowrap transition-all duration-200 active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-accent text-black font-black shadow-accent scale-105'
                    : 'bg-black/35 backdrop-blur-md border border-white/10 text-zinc-300 hover:bg-white/10'
                }`}
              >
                <Icon size={12} className={isSelected ? 'text-black' : 'text-zinc-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Mobile Apps Grid */}
      <div className="flex-1 min-h-[220px]">
        {filteredApps.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-2">
              <Search size={22} />
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Aucune application trouvée pour "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-zinc-200"
            >
              Effacer la recherche
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 content-start pb-2">
            {filteredApps.map((app) => {
              const Icon = app.icon || Box;
              const running = isRunning(app.id);

              return (
                <div
                  key={app.id}
                  onClick={() => handleLaunch(app.id)}
                  className="flex flex-col items-center group cursor-pointer active:scale-90 transition-transform duration-150 relative"
                >
                  {/* Squircle Icon Container */}
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/90 backdrop-blur-xl border border-white/12 shadow-[0_4px_16px_rgba(0,0,0,0.5)] group-active:shadow-accent/40 flex items-center justify-center overflow-hidden">
                    <Icon size={28} className="text-zinc-100 group-hover:text-accent transition-colors" />

                    {/* Active running badge dot */}
                    {running && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-accent ring-2 ring-black/80 animate-pulse" />
                    )}
                  </div>

                  {/* App Label */}
                  <span className="mt-1.5 text-[10px] font-medium text-zinc-200 text-center truncate w-full px-1 drop-shadow-md group-hover:text-white leading-tight">
                    {app.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Mobile Floating Dock (4 primary apps) */}
      <div className="mt-auto pt-2 shrink-0">
        <div className="px-4 py-2.5 rounded-3xl bg-black/50 backdrop-blur-3xl border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.7)] flex items-center justify-around max-w-sm mx-auto">
          {/* Files */}
          <button
            onClick={() => handleLaunch('explorer')}
            className="flex flex-col items-center active:scale-85 transition-transform"
            aria-label="Fichiers"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-md">
              <Folder size={24} className="text-blue-400" />
            </div>
            <span className="text-[9px] font-medium text-zinc-300 mt-1">Fichiers</span>
          </button>

          {/* Browser */}
          <button
            onClick={() => handleLaunch('netrunner')}
            className="flex flex-col items-center active:scale-85 transition-transform"
            aria-label="Navigateur"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-md">
              <Globe size={24} className="text-emerald-400" />
            </div>
            <span className="text-[9px] font-medium text-zinc-300 mt-1">Navigateur</span>
          </button>

          {/* AI Assistant */}
          <button
            onClick={() => handleLaunch('aion_agent')}
            className="flex flex-col items-center active:scale-85 transition-transform"
            aria-label="IA Assistant"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shadow-md">
              <Bot size={24} className="text-violet-400" />
            </div>
            <span className="text-[9px] font-medium text-zinc-300 mt-1">Aion IA</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => handleLaunch('settings')}
            className="flex flex-col items-center active:scale-85 transition-transform"
            aria-label="Réglages"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-700/30 border border-white/20 flex items-center justify-center shadow-md">
              <Settings size={24} className="text-zinc-300" />
            </div>
            <span className="text-[9px] font-medium text-zinc-300 mt-1">Réglages</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileHomeScreen;
