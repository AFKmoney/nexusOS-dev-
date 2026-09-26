import React, { useState, useMemo } from 'react';
import { useOS } from '../store/osStore';
import { vfs, SYSTEM_VFS_APP_ID } from '../kernel/fileSystem';
import { PROCEDURAL_WALLPAPERS } from '../appShellConstants';
import {
  Power, Search, LogOut, Settings, User, Clock, Lock, Shield,
  Wallpaper, Palette, Layers3, Store, MonitorCog, LaptopMinimalCheck,
} from 'lucide-react';
import { getSmartIcon } from '../utils/smartIcons';
import { useMobileDetection } from '../hooks/useMobileDetection';

export default function StartMenu() {
  const {
    isStartMenuOpen, registry, installedApps, openWindow, systemReset,
    currentUser, logout, openContextMenu, toggleStartMenu,
    lockShell,
    wallpaper, wallpaperEffect, themePreset, aiManagedStoreEnabled,
    setWallpaper, setWallpaperEffect, setThemePreset,
    setAiManagedStoreEnabled, setAccentColor,
    mobileMode, isMobileView: storeIsMobileView,
  } = useOS();

  const { isMobile: detectedMobile } = useMobileDetection(mobileMode);
  const isMobile = storeIsMobileView || detectedMobile;

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showControls, setShowControls] = useState(false);

  const recentFiles = useMemo(() => {
    if (!isStartMenuOpen) return [];
    const list = vfs.listDir('/home/user/Desktop', SYSTEM_VFS_APP_ID);
    return (list || [])
      .map(f => {
        const fullPath = `/home/user/Desktop/${f}`;
        const stat = vfs.stat(fullPath);
        return { name: f, path: fullPath, modified: stat?.modified || 0, type: stat?.type };
      })
      .filter(n => n.type === 'file')
      .sort((a, b) => b.modified - a.modified)
      .slice(0, 4);
  }, [isStartMenuOpen]);

  if (!isStartMenuOpen) return null;

  const CATEGORIES: Record<string, string[]> = {
    'All': [],
    'System': ['dashboard', 'settings', 'monitor', 'task_manager', 'clipboard', 'notifications', 'device_manager', 'recyclebin'],
    'AI & Dev': ['business_autonomy', 'hyperide', 'forge', 'daemon_chat', 'aion_agent', 'model_manager', 'nfr', 'terminal', 'ubuntu', 'snippets'],
    'Media': ['paint', 'video_player', 'image_viewer', 'music', 'wallpaper', 'fractal', 'gba'],
    'Games': ['gba'],
    'Productivity': ['notepad', 'explorer', 'calculator', 'calendar', 'rich_editor', 'kanban', 'pomodoro', 'habits', 'contacts'],
    'Utilities': ['appstore', 'silence', 'native_zip', 'sticky_notes', 'vault', 'voice_recorder', 'markdown', 'rss', 'accessibility', 'screenshot', 'sysinfo', 'weather'],
  };

  const categoriesList = Object.keys(CATEGORIES);

  const displayedApps = registry.filter(app => {
    if (!installedApps.includes(app.id)) return false;
    if (app.hidden) return false;
    if (search && !app.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== 'All' && !search) {
      const inCat = CATEGORIES[activeCategory]?.includes(app.id);
      if (!inCat) return false;
    }
    return true;
  });

  const handleAppRightClick = (e: React.MouseEvent, appId: string) => {
    e.preventDefault(); e.stopPropagation();
    openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'app-icon', appId });
  };

  const ACCENTS = [
    { name: 'Emerald', color: '#10b981' },
    { name: 'Amber', color: '#f59e0b' },
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Rose', color: '#f43f5e' },
    { name: 'Violet', color: '#8b5cf6' },
    { name: 'Zinc', color: '#71717a' },
  ];

  return (
    <div
      className={`start-menu fixed z-[9990] bg-[#08080c]/98 backdrop-blur-3xl border border-white/12 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-200 ${
        isMobile
          ? 'inset-x-0 bottom-14 top-4 rounded-t-3xl rounded-b-none max-w-none h-auto'
          : 'bottom-16 left-3 w-[640px] max-w-[calc(100vw-24px)] h-[560px] max-h-[calc(85vh-70px)] rounded-2xl'
      }`}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button[title*="Right-click"]') || target.closest('button[title*="Add to Desktop"]')) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'nexus-menu' });
      }}
    >
      {isMobile && (
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2 mb-1 shrink-0" />
      )}
      <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 shrink-0 border-b border-white/5 relative z-10">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
          <input
            className="w-full bg-black/50 border border-white/10 rounded-xl py-2 sm:py-2.5 pl-10 sm:pl-12 pr-4 text-sm text-zinc-100 focus:outline-none focus:border-accent/50 transition-colors placeholder:text-zinc-500"
            placeholder="Search applications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus={!isMobile}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-h-0">
        <div className="px-3.5 sm:px-4 pt-2.5 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors shrink-0 ${activeCategory === cat
                ? 'bg-accent text-black font-black'
                : 'text-zinc-400 hover:text-zinc-200 bg-white/5 active:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setShowControls(!showControls)}
            className={`ml-auto px-2 py-1 rounded-lg transition-colors shrink-0 ${showControls ? 'bg-accent/20 text-accent' : 'text-zinc-500 hover:text-zinc-300 bg-white/5'}`}
            title="Surface Controls"
            aria-label="Toggle Surface Controls"
          >
            <MonitorCog size={14} />
          </button>
        </div>
        {showControls && (
          <div className="px-3.5 sm:px-4 pb-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button onClick={() => {
                const keys = Object.keys(PROCEDURAL_WALLPAPERS);
                if (keys.length === 0) return;
                const idx = keys.indexOf(wallpaper);
                const next = keys[(idx + 1) % keys.length]!;
                setWallpaper(next);
                const label = next.split('/').pop();
                if (label === 'aurora' || label === 'nebula') setWallpaperEffect(label);
              }}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-left">
                <Wallpaper size={14} className="text-accent shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-300">Effect</div>
                  <div className="text-[10px] text-zinc-500 truncate">{wallpaperEffect === 'aurora' ? 'Aurora' : 'Cycle'}</div>
                </div>
              </button>
              <button onClick={() => setThemePreset(themePreset === 'midnight-cyan' ? 'obsidian-emerald' : 'midnight-cyan')}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-left">
                <Palette size={14} className="text-accent shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-300">Theme</div>
                  <div className="text-[10px] text-zinc-500 truncate">{themePreset === 'midnight-cyan' ? 'Cyan' : 'Emerald'}</div>
                </div>
              </button>
              <button onClick={() => {
                  const currentHex = useOS.getState().accentColor.toLowerCase();
                  const currentIndex = ACCENTS.findIndex(a => a.color.toLowerCase() === currentHex);
                  const nextIndex = (currentIndex + 1) % ACCENTS.length;
                  setAccentColor(ACCENTS[nextIndex].color);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-left">
                <Layers3 size={14} className="text-accent shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-300">Accent</div>
                  <div className="text-[10px] text-zinc-500 truncate">Cycle</div>
                </div>
              </button>
              <button onClick={() => setAiManagedStoreEnabled(!aiManagedStoreEnabled)}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-colors text-left ${aiManagedStoreEnabled ? 'bg-accent/10 border-accent/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                <LaptopMinimalCheck size={14} className={aiManagedStoreEnabled ? 'text-accent shrink-0' : 'text-zinc-500 shrink-0'} />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-300">AI Store</div>
                  <div className="text-[10px] text-zinc-500 truncate">{aiManagedStoreEnabled ? 'On' : 'Off'}</div>
                </div>
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3.5 sm:px-4 pb-4 min-h-0">
          {!search && activeCategory === 'All' && recentFiles.length > 0 && !isMobile && (
            <div className="mb-3.5">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={12} className="text-accent" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recent</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {recentFiles.slice(0, 2).map(file => (
                  <button
                    key={file.path}
                    onClick={() => { openWindow('notepad', { path: file.path }); toggleStartMenu(); }}
                    className="flex items-center gap-2.5 p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-white/15 transition-colors text-left group"
                  >
                    <div className="p-1.5 bg-black/40 rounded-lg text-zinc-400 group-hover:text-accent transition-colors shrink-0">
                      {getSmartIcon(file.path, 14)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-zinc-200 truncate group-hover:text-white transition-colors">{file.name}</div>
                      <div className="text-[9px] font-mono text-zinc-500 truncate">{new Date(file.modified).toLocaleTimeString('en-US')}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">
              {activeCategory === 'All' ? 'All Applications' : activeCategory}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono ml-auto">{displayedApps.length} apps</span>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-4 gap-2.5' : 'grid-cols-5 gap-2'} pb-2`}>
            {displayedApps.map(app => {
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => { openWindow(app.id); toggleStartMenu(); }}
                  onContextMenu={(e) => handleAppRightClick(e, app.id)}
                  title={`${app.name}`}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors group hover:bg-white/10 active:bg-white/15 border border-transparent hover:border-white/10"
                >
                  <div className={`${isMobile ? 'w-12 h-12' : 'w-11 h-11'} bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-accent/40 group-active:scale-95 transition-all shadow-sm`}>
                    <Icon size={isMobile ? 22 : 20} className="text-zinc-200 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-300 text-center line-clamp-1 w-full px-0.5 group-hover:text-accent transition-colors">
                    {app.name}
                  </span>
                </button>
              );
            })}
          </div>
          {displayedApps.length === 0 && (
            <div className="col-span-full text-center py-12 flex flex-col items-center gap-2">
              <Search size={24} className="text-zinc-600" />
              <div className="text-xs text-zinc-500 uppercase tracking-widest">No apps found</div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-black/60 backdrop-blur-xl px-3.5 sm:px-4 py-2.5 sm:py-3 border-t border-white/10 flex items-center justify-between shrink-0 relative z-20">
        <button
          className="flex items-center gap-2.5 sm:gap-3 hover:bg-white/5 p-1.5 sm:p-2 -ml-1 rounded-xl transition-colors group"
          onClick={() => { openWindow('settings'); toggleStartMenu(); }}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent text-black flex items-center justify-center text-sm font-bold border-2 border-[#08080c] group-hover:scale-105 transition-transform">
            {currentUser?.name?.[0] || <User size={16} />}
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate max-w-[100px] sm:max-w-none">{currentUser?.name || "Admin"}</span>
              <Shield size={11} className="text-accent" />
            </div>
            <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono tracking-wider flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              ONLINE
            </span>
          </div>
        </button>
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-black/60 rounded-xl border border-white/10">
          <button onClick={() => { lockShell(); toggleStartMenu(); }} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Lock" aria-label="Lock screen"><Lock size={15} /></button>
          <button onClick={() => { openWindow('appstore'); toggleStartMenu(); }} className="w-8 h-8 flex items-center justify-center hover:bg-accent/20 hover:text-emerald-300 rounded-lg text-zinc-400 transition-colors" title="App Store" aria-label="App store"><Store size={15} /></button>
          <button onClick={() => { logout(); toggleStartMenu(); }} className="w-8 h-8 flex items-center justify-center hover:bg-amber-500/20 hover:text-amber-400 rounded-lg text-zinc-400 transition-colors" title="Logout" aria-label="Logout"><LogOut size={15} /></button>
          <div className="w-px h-5 bg-white/10 mx-0.5" />
          <button onClick={() => systemReset(false)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg text-red-400 transition-colors" title="Restart" aria-label="Restart system"><Power size={15} /></button>
        </div>
      </div>
    </div>
  );
}
