import React, { useState, useEffect } from 'react';
import { useOS } from '../store/osStore';
import { useSystemControls } from '../hooks/useSystemControls';
import { Zap, Wifi, Volume2, VolumeX, Lock, Droplet, Bell, ChevronUp, Moon, Shield, Settings, Sun, BatteryFull, BatteryCharging, WifiOff, Smartphone, Monitor } from 'lucide-react';
import { notificationQueue } from '../kernel/notificationQueue';
import { useMobileDetection } from '../hooks/useMobileDetection';

export default function Taskbar() {
  const {
    openWindow,
    windows,
    activeWindowId,
    activeWorkspace,
    switchWorkspace,
    restoreWindow,
    minimizeWindow,
    registry,
    toggleStartMenu,
    isStartMenuOpen,
    openContextMenu,
    focusWindow,
    pinnedApps,
    kernelRules,
    updateKernelRules,
    mobileMode,
    setMobileMode,
    isMobileView: storeIsMobileView,
  } = useOS();

  const { isMobile: detectedMobile } = useMobileDetection(mobileMode);
  const isMobile = storeIsMobileView || detectedMobile;

  const {
    volume, setVolume, isMuted, toggleMute,
    brightness, setBrightness,
    batteryLevel, isCharging,
    isOnline, connectionType, effectiveType,
  } = useSystemControls();

  const [time, setTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setUnreadCount(notificationQueue.getUnreadCount());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskbarRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'taskbar' });
  };

  const handleWindowClick = (w: any) => {
    if (activeWindowId === w.id && !w.isMinimized) minimizeWindow(w.id);
    else if (w.isMinimized) restoreWindow(w.id);
    else focusWindow(w.id);
  };

  const safePinnedApps = Array.isArray(pinnedApps) ? pinnedApps : [];
  const currentWorkspaceWindows = windows.filter(w => w.workspaceId === activeWorkspace || !w.workspaceId);

  return (
    <div
      onContextMenu={handleTaskbarRightClick}
      className={`taskbar fixed z-50 select-none ${
        isMobile
          ? 'left-0 right-0 bottom-0 h-14 pb-safe'
          : 'left-3 right-3 bottom-3 h-14'
      }`}
    >
      <div className={`h-full ${isMobile ? 'rounded-t-2xl rounded-b-none border-t border-white/15 px-2 bg-[#09090d]/95' : 'rounded-2xl border border-white/12 px-3 bg-white/8'} backdrop-blur-2xl flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/5`}>
        {/* Left: Start + Pinned Apps */}
        <div className="flex items-center gap-1.5 sm:gap-3 h-full min-w-0">
          <button
            onClick={(e) => { e.stopPropagation(); toggleStartMenu(); }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'nexus-menu' });
            }}
            aria-label="Nexus Start Menu"
            className={`group relative flex items-center gap-2 px-2.5 sm:px-3 h-10 rounded-xl transition-all duration-300 shrink-0 ${
              isStartMenuOpen
                ? 'bg-accent/20 text-accent ring-1 ring-accent/30'
                : 'bg-white/5 text-zinc-300 border border-white/5 hover:border-accent/20 active:bg-white/10'
            }`}
          >
            <div className={`w-5 h-5 bg-accent rounded-md flex items-center justify-center shadow-sm transition-transform duration-300 ${isStartMenuOpen ? 'rotate-180' : 'group-hover:rotate-12'}`}>
              <Zap size={12} className="text-black fill-current" />
            </div>
            <span className="font-bold text-xs tracking-[0.2em] hidden sm:inline">NEXUS</span>
          </button>

          {/* Mobile view quick switcher tabs or desktop pinned apps */}
          {!isMobile ? (
            <>
              <div className="h-8 w-px bg-white/10 mx-1" />
              <div className="flex items-center gap-1.5">
                {safePinnedApps.map(appId => {
                  const app = registry.find(a => a.id === appId);
                  if (!app) return null;
                  const isActive = windows.some(w => w.appId === app.id);
                  const Icon = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => openWindow(app.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'app-icon', appId: app.id });
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-white/10 shadow-inner' : 'hover:bg-white/10'}`}
                    >
                      <Icon size={20} className={`transition-colors ${isActive ? 'text-accent' : 'text-zinc-400 group-hover:text-white'}`} />
                      {isActive && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />}
                      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-200 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg translate-y-2 group-hover:translate-y-0 z-[100]">
                        {app.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Mobile: compact scrollable active windows or top pinned */
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 max-w-[200px] xs:max-w-[240px]">
              {currentWorkspaceWindows.slice(0, 4).map(w => {
                const app = registry.find(a => a.id === w.appId);
                const Icon = app?.icon || Zap;
                const isFocused = activeWindowId === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => handleWindowClick(w)}
                    className={`h-9 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                      isFocused && !w.isMinimized
                        ? 'bg-accent/20 border border-accent/40 text-accent font-bold'
                        : 'bg-white/5 border border-white/5 text-zinc-400'
                    }`}
                  >
                    <Icon size={14} className={isFocused ? 'text-accent' : 'text-zinc-400'} />
                    <span className="truncate max-w-[60px]">{w.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Center: Window Tabs (Desktop only) */}
        {!isMobile && (
          <div className="flex-1 flex justify-center gap-1.5 px-4 overflow-hidden h-full items-center">
            {currentWorkspaceWindows.map(w => {
              const app = registry.find(a => a.id === w.appId);
              const Icon = app?.icon || Lock;
              const isFocused = activeWindowId === w.id;
              return (
                <div key={w.id} className="relative group">
                  <button
                    onClick={() => handleWindowClick(w)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'window', targetId: w.id });
                    }}
                    className={`px-3 h-9 rounded-lg text-xs font-medium truncate max-w-[160px] transition-all border flex items-center gap-2 ${
                      isFocused && !w.isMinimized
                        ? 'bg-white/10 border-white/15 text-white'
                        : 'bg-black/30 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                    } ${w.isMinimized ? 'opacity-50' : ''}`}
                  >
                    <Icon size={13} className={isFocused ? 'text-accent' : 'text-zinc-500'} />
                    <span className="truncate">{w.title}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Right: System Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 h-full">
          {/* Mobile mode manual toggle indicator */}
          <button
            onClick={() => {
              const nextMode = mobileMode === 'mobile' ? 'desktop' : mobileMode === 'desktop' ? 'auto' : 'mobile';
              setMobileMode(nextMode);
            }}
            title={`View Mode: ${mobileMode.toUpperCase()} (Click to toggle: Auto / Mobile / Desktop)`}
            className={`p-2 rounded-xl border transition-all ${
              isMobile
                ? 'bg-accent/15 border-accent/30 text-accent'
                : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            {isMobile ? <Smartphone size={15} /> : <Monitor size={15} />}
          </button>

          {/* Desktop Workspace Switcher */}
          {!isMobile && (
            <>
              <div className="flex items-center gap-1 bg-black/60 rounded-2xl border border-white/10 p-1.5 shadow-inner">
                {[1, 2, 3].map(i => (
                  <button
                    key={i}
                    onClick={() => switchWorkspace(i)}
                    className={`w-7 h-7 rounded-xl text-[10px] font-black transition-all duration-300 ${
                      activeWorkspace === i
                        ? 'bg-accent text-black shadow-accent scale-110'
                        : 'text-zinc-600 hover:bg-white/5 hover:text-zinc-300'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="h-8 w-px bg-white/10" />
            </>
          )}

          {/* Notifications */}
          <button onClick={() => openWindow('notifications')} className="relative p-2 sm:p-2.5 hover:bg-white/10 rounded-xl transition-all group">
            <Bell size={isMobile ? 16 : 18} className="text-zinc-400 group-hover:text-white transition-colors" />
            {unreadCount > 0 && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#030305] shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />}
          </button>

          {/* Full Autonomy / AutoPilot indicators */}
          {kernelRules.fullAutonomy && (
            <button
              onClick={() => updateKernelRules({ fullAutonomy: false })}
              title="Full Autonomy is ON — click to disable"
              className="p-2 sm:p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 transition-all group"
            >
              <Shield size={16} className="text-rose-400 group-hover:text-rose-300 animate-pulse" />
            </button>
          )}
          {kernelRules.autonomyEnabled && !kernelRules.fullAutonomy && (
            <button
              onClick={() => openWindow('governance')}
              title="Autonomy Engine is running — click to inspect"
              className="p-2 sm:p-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 transition-all group"
            >
              <Zap size={16} className="text-accent group-hover:text-emerald-300" />
            </button>
          )}

          {/* Quick Settings Toggle */}
          <button
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            aria-label="Quick Settings"
            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${showQuickSettings ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
          >
            <ChevronUp size={isMobile ? 16 : 18} className={`transition-transform duration-500 ${showQuickSettings ? 'rotate-180' : ''}`} />
          </button>

          {/* Network + Battery (Desktop or wider screens) */}
          {!isMobile && (
            <div className="flex items-center gap-2 bg-black/35 px-3 h-11 rounded-2xl border border-white/10 shadow-inner cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 px-2 py-1 rounded-xl">
                <span className="text-[10px] font-black text-zinc-400 font-mono tracking-tighter uppercase">
                  {effectiveType ? effectiveType.toUpperCase() : (isOnline ? 'ONLINE' : 'OFFLINE')}
                </span>
                {isOnline ? <Wifi size={14} className="text-accent" /> : <WifiOff size={14} className="text-red-500" />}
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-xl">
                {isCharging
                  ? <BatteryCharging size={14} className="text-accent" />
                  : <BatteryFull size={14} className={batteryLevel <= 20 ? 'text-red-400' : 'text-zinc-400'} />
                }
                <span className={`text-[10px] font-black font-mono ${batteryLevel <= 20 ? 'text-red-400' : 'text-zinc-400'}`}>{batteryLevel}%</span>
              </div>
            </div>
          )}

          {/* Clock */}
          <button onClick={() => openWindow('calendar')} className="flex flex-col items-end min-w-[50px] sm:min-w-[80px] group cursor-pointer px-1">
            <span className="text-zinc-100 font-black text-xs sm:text-sm tracking-wide sm:tracking-widest leading-none group-hover:text-accent transition-colors tabular-nums">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isMobile && (
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1 group-hover:text-zinc-200 transition-colors">
                {time.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
              </span>
            )}
          </button>

          {/* Show Desktop */}
          <button
            className="w-7 sm:w-8 h-8 sm:h-9 bg-white/5 hover:bg-accent/20 rounded-lg transition-colors flex items-center justify-center shrink-0"
            title="Show Desktop"
            onClick={() => windows.forEach(w => minimizeWindow(w.id))}
          >
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border border-white/20 rounded-sm" />
          </button>
        </div>

        {/* Quick Settings Panel */}
        {showQuickSettings && (
          <div
            className={`absolute bottom-16 ${isMobile ? 'left-3 right-3' : 'right-4 w-72'} bg-[#0a0a0c]/95 backdrop-blur-[50px] border border-white/10 rounded-2xl sm:rounded-[28px] p-4 sm:p-5 shadow-[0_40px_100px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-5 fade-in duration-200 ring-1 ring-white/10 z-50`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Viewport & Display Mode */}
            <div className="mb-4 pb-3 border-b border-white/10">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Display Mode</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['auto', 'mobile', 'desktop'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setMobileMode(mode)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      mobileMode === mode
                        ? 'bg-accent text-black font-black'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Control */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    {isMuted || volume === 0
                      ? <VolumeX size={16} className="text-red-400" />
                      : <Volume2 size={16} className="text-accent" />
                    }
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Volume</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-300">{isMuted ? 'MUTED' : `${volume}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full h-2 bg-black rounded-full appearance-none cursor-pointer shadow-inner border border-white/5 accent-emerald-500"
              />
            </div>

            {/* Brightness Control */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sun size={16} className="text-accent" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Brightness</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-zinc-300">{brightness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full h-2 bg-black rounded-full appearance-none cursor-pointer shadow-inner border border-white/5 accent-blue-500"
              />
            </div>

            {/* Connection Info */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5 mb-2.5">
              <div className="flex items-center gap-2">
                {isOnline ? <Wifi size={14} className="text-accent" /> : <WifiOff size={14} className="text-red-400" />}
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
                  {isOnline ? 'Connected' : 'Offline'}
                </span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">
                {connectionType}{effectiveType ? ` · ${effectiveType.toUpperCase()}` : ''}
              </span>
            </div>

            {/* Battery Info */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5 mb-3">
              <div className="flex items-center gap-2">
                {isCharging
                  ? <BatteryCharging size={14} className="text-accent" />
                  : <BatteryFull size={14} className={batteryLevel <= 20 ? 'text-red-400' : 'text-zinc-300'} />
                }
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
                  {batteryLevel}%
                </span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500">
                {isCharging ? 'Charging' : batteryLevel <= 20 ? 'Low Battery' : 'On Battery'}
              </span>
            </div>

            {/* Open Settings */}
            <button
              onClick={() => { setShowQuickSettings(false); openWindow('settings'); }}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all group"
            >
              <Settings size={14} className="text-zinc-500 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Open Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

