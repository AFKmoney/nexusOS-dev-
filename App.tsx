import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useOS, hydrateOSRegistry } from './store/osStore';
import { WindowFrame } from './components/WindowFrame';
import TaskSwitcher from './components/TaskSwitcher';
import ContextMenu from './components/ContextMenu';
import StartMenu from './components/StartMenu';
import Taskbar from './components/Taskbar';
import { vfs, SYSTEM_VFS_APP_ID } from './kernel/fileSystem';
import { getSmartIcon } from './utils/smartIcons';
import { Bell, X, Info, Trash2, ArrowRight, Lock, Sparkles, Cpu, Activity, Zap, Users } from 'lucide-react';
import { bindOsStore } from './services/puterService';
import { toolForge } from './kernel/toolForge';
import { sounds } from './kernel/sounds';
import { processManager } from './kernel/processManager';
import { themeEngine } from './kernel/themeEngine';
import { eventBus, OS_EVENTS } from './kernel/eventBus';
import BootScreen from './components/BootScreen';
import LoginScreen from './components/LoginScreen';
import DesktopWallpaper from './components/DesktopWallpaper';
import { DaemonLockScreen } from './components/DaemonLockScreen';
import LockScreen from './components/LockScreen';
import { NeuralHoloUI } from './components/NeuralHoloUI';
import ToastContainer from './components/ToastContainer';
import { getDesktopPath } from './appShellConstants';
import { kernelLog } from './kernel/log';
import { useMobileDetection } from './hooks/useMobileDetection';
import { useParallax3DS } from './hooks/useParallax3DS';
import MobileStatusBar from './components/MobileStatusBar';
import MobileHomeScreen from './components/MobileHomeScreen';
import MobileNavBar from './components/MobileNavBar';
import MobileAppSwitcher from './components/MobileAppSwitcher';
import MobileControlCenter from './components/MobileControlCenter';

// DAEMON Bridge — Auto-initializes on import. If installed, boots silently.
import './kernel/daemonBridge';

function NeuralThoughtStream() {
  const { autonomyLog, currentObjective, autonomyState, kernelRules } = useOS();
  if (!kernelRules.autonomyEnabled) return null;

  return (
    <div className="fixed top-20 right-6 w-64 bg-black/50 backdrop-blur-xl border border-white/8 rounded-2xl p-3.5 z-0 pointer-events-none select-none">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`p-1.5 rounded-lg ${autonomyState !== 'IDLE' ? 'bg-accent/15 text-accent' : 'bg-zinc-800/80 text-zinc-500'}`}>
          <Cpu size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Neural Engine</div>
          <div className="text-[11px] text-white font-medium truncate">{currentObjective || 'Idle'}</div>
        </div>
        {autonomyState !== 'IDLE' && (
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
        )}
      </div>
      <div className="space-y-1.5 h-32 overflow-hidden relative">
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/50 to-transparent z-10" />
        {autonomyLog.slice(-4).map((log, i) => (
          <div key={i} className="text-[10px] font-mono text-zinc-400 border-l border-accent/20 pl-2 leading-relaxed">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

type DesktopIconGridProps = {
  currentUserId?: string | null;
  isMobile?: boolean;
  openContextMenu: (state: {
    isOpen: boolean;
    x: number;
    y: number;
    targetType: 'desktop' | 'icon' | 'taskbar';
    filePath?: string;
  }) => void;
  openWindow: (appId: string, data?: { title?: string; path?: string; [key: string]: unknown }) => void;
};

function DesktopIconGrid({
  currentUserId,
  isMobile,
  openContextMenu,
  openWindow
}: DesktopIconGridProps) {
  const desktopPath = getDesktopPath(currentUserId);
  const accentColor = useOS((state) => state.accentColor);
  const { iconOffsetX, iconOffsetY, triggerImpulse } = useParallax3DS();

  useEffect(() => {
    themeEngine.setCustomAccent(accentColor);
    themeEngine.apply();
  }, [accentColor]);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Persisted icon positions — survive reboot. Keyed by filename.
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('nexusos_desktop_positions') || '{}');
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('nexusos_desktop_positions', JSON.stringify(iconPositions));
  }, [iconPositions]);

  // Rescue out-of-bounds icons
  useEffect(() => {
    let changed = false;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const newPos = { ...iconPositions };
    Object.entries(newPos).forEach(([name, pos]) => {
      if (pos.x < 0 || pos.y < 0 || pos.x > w - 80 || pos.y > h - 120) {
        delete newPos[name];
        changed = true;
      }
    });
    if (changed) {
      setIconPositions(newPos);
    }
  }, []);

  const handleFileOpen = useCallback((path: string) => {
    const node = vfs.stat(path);
    if (!node) return;
    if (node.type === 'directory') {
      openWindow('explorer', { path });
    } else if (path.endsWith('.lnk')) {
      const content = vfs.readFile(path, SYSTEM_VFS_APP_ID);
      if (content && content.startsWith('NEXUSOS_APP_SHORTCUT:')) {
        const appId = content.slice('NEXUSOS_APP_SHORTCUT:'.length);
        openWindow(appId);
      } else {
        openWindow('notepad', { path });
      }
    } else if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif')) {
      openWindow('image_viewer', { path });
    } else if (path.endsWith('.mp4') || path.endsWith('.webm')) {
      openWindow('video_player', { path });
    } else if (path.endsWith('.pdf')) {
      openWindow('fileprops', { path });
    } else if (path.endsWith('.md')) {
      openWindow('markdown', { path });
    } else if (path.endsWith('.html')) {
      openWindow('web_runner', { path });
    } else {
      openWindow('notepad', { path });
    }
  }, [openWindow]);

  const handleDesktopDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Check if this is a desktop icon reposition (custom MIME type)
    const iconName = e.dataTransfer.getData('text/nexusos-desktop-icon');
    if (iconName) {
      // Snap to 10px grid
      let x = Math.round((e.clientX - rect.left) / 10) * 10;
      let y = Math.round((e.clientY - rect.top) / 10) * 10;
      
      const maxX = rect.width - 96;
      const maxY = rect.height - 96;
      
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));
      setIconPositions(prev => ({ ...prev, [iconName]: { x, y } }));
      return; // Don't move the file — just reposition the icon
    }

    const sourcePath = e.dataTransfer.getData('text/plain');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(fileLike => {
        const file = fileLike as File;
        const reader = new FileReader();
        reader.onload = (ev) => {
          vfs.writeFile(`${desktopPath}/${file.name}`, ev.target?.result as string, SYSTEM_VFS_APP_ID);
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    if (sourcePath && !sourcePath.startsWith(`${desktopPath}/`)) {
      vfs.move(sourcePath, `${desktopPath}/${sourcePath.split('/').pop()}`);
    }
  }, [desktopPath]);

  const [desktopItems, setDesktopItems] = useState<string[]>(() => {
    return vfs.listDir(desktopPath, SYSTEM_VFS_APP_ID) || [];
  });

  const refreshDesktop = useCallback(() => {
    const items = vfs.listDir(desktopPath, SYSTEM_VFS_APP_ID) || [];
    setDesktopItems(items);
  }, [desktopPath]);

  useEffect(() => {
    refreshDesktop();
    const unsubs = [
      eventBus.on('VFS_FILE_CREATED', refreshDesktop),
      eventBus.on('VFS_FILE_MODIFIED', refreshDesktop),
      eventBus.on('VFS_FILE_DELETED', refreshDesktop),
      eventBus.on('VFS_DIR_CREATED', refreshDesktop),
      eventBus.on('app:generated', refreshDesktop),
      eventBus.on('app:registered', refreshDesktop),
      eventBus.on('app:shortcut-created', refreshDesktop),
    ];
    const timer = setInterval(refreshDesktop, 1500);
    return () => {
      unsubs.forEach(u => u());
      clearInterval(timer);
    };
  }, [desktopPath, refreshDesktop]);

  // In mobile mode, always use clean touch-friendly grid without overlapping freeform positions
  const positionedItems = isMobile ? [] : desktopItems.filter(name => iconPositions[name]);
  const gridItems = isMobile ? desktopItems : desktopItems.filter(name => !iconPositions[name]);

  return (
    <div
      ref={desktopRef}
      className={`absolute inset-0 ${isMobile ? 'bottom-16 p-3' : 'bottom-16 p-5'} overflow-y-auto custom-scrollbar`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDesktopDrop}
      onClick={(e) => {
        if (e.target === desktopRef.current) {
          triggerImpulse();
        }
      }}
      style={{
        transform: `translate3d(${iconOffsetX}px, ${iconOffsetY}px, 0)`,
        transition: 'transform 0.08s ease-out',
        willChange: 'transform',
      }}
    >
      {/* Grid items (default position) */}
      <div className={`grid ${isMobile ? 'grid-cols-4 gap-2' : 'grid-cols-[repeat(auto-fill,96px)] grid-rows-[repeat(auto-fill,96px)] gap-3'} h-full content-start`}>
        {gridItems.map(name => {
          const itemPath = `${desktopPath}/${name}`;
          const displayName = name.endsWith('.lnk') ? name.slice(0, -4) : name;
          return (
            <div
              key={name}
              draggable={!isMobile}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', itemPath);
                e.dataTransfer.setData('text/nexusos-desktop-icon', name);
              }}
              className="flex flex-col items-center p-2 rounded-xl hover:bg-white/5 active:bg-white/10 cursor-pointer group transition-colors"
              onClick={() => {
                if (isMobile) handleFileOpen(itemPath);
              }}
              onDoubleClick={() => handleFileOpen(itemPath)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'icon', filePath: itemPath });
              }}
            >
              <div className={`${isMobile ? 'w-11 h-11' : 'w-12 h-12'} bg-zinc-900/60 rounded-xl flex items-center justify-center border border-white/8 group-hover:border-accent/30 group-active:scale-95 transition-all shadow-md group-hover:shadow-accent`}>
                {getSmartIcon(itemPath, isMobile ? 22 : 24)}
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-300 mt-1.5 text-center truncate w-full drop-shadow-md group-hover:text-white transition-colors">{displayName}</span>
            </div>
          );
        })}
      </div>

      {/* Positioned items (absolute, user-moved) - Desktop only */}
      {!isMobile && positionedItems.map(name => {
        const itemPath = `${desktopPath}/${name}`;
        const pos = iconPositions[name]!;
        const displayName = name.endsWith('.lnk') ? name.slice(0, -4) : name;
        return (
          <div
            key={name}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', itemPath);
              e.dataTransfer.setData('text/nexusos-desktop-icon', name);
            }}
            className="absolute flex flex-col items-center p-2 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
            style={{ left: pos.x, top: pos.y, width: 96 }}
            onDoubleClick={() => handleFileOpen(itemPath)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'icon', filePath: itemPath });
            }}
          >
            <div className="w-12 h-12 bg-zinc-900/50 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-accent/30 transition-all shadow-md group-hover:shadow-accent">
              {getSmartIcon(itemPath, 24)}
            </div>
            <span className="text-[11px] text-zinc-300 mt-1.5 text-center truncate w-full drop-shadow-md group-hover:text-white transition-colors">{displayName}</span>
          </div>
        );
      })}
    </div>
  );
}

function DesktopWidgets({ isMobile }: { isMobile?: boolean }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`absolute pointer-events-none select-none z-0 text-white/80 items-end ${
      isMobile 
        ? 'top-3 right-3 flex flex-col gap-0'
        : 'top-6 right-6 flex flex-col gap-0.5'
    }`}>
      <div className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-light tracking-tight drop-shadow-lg tabular-nums`}>
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium drop-shadow-md text-accent/80`}>
        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}

const GlobalSearchOverlay = React.lazy(() => import('./components/GlobalSearch'));
const Spotlight = React.lazy(() => import('./components/Spotlight'));


export default function App() {
  const {
    booted,
    isLoggedIn,
    hasSeenIntro,
    uiScale,
    windows,
    activeWorkspace,
    wallpaper,
    openContextMenu,
    openWindow,
    closeWindow,
    minimizeWindow,
    isSearchOpen,
    toggleSearch,
    currentUser,
    isStartMenuOpen,
    toggleStartMenu,
    profiles,
    login,
    setBooted,
    mobileMode,
    isMobileView: storeIsMobileView,
    setIsMobileView
  } = useOS();
  const { lockShell, unlockShell, isShellLocked: locked } = useOS();
  const [bootTimedOut, setBootTimedOut] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [mobileAppSwitcherOpen, setMobileAppSwitcherOpen] = useState(false);
  const [mobileControlCenterOpen, setMobileControlCenterOpen] = useState(false);
  const { triggerImpulse } = useParallax3DS();

  const { isMobile: detectedMobile } = useMobileDetection(mobileMode);
  const isMobile = storeIsMobileView || detectedMobile;

  const hasVisibleMobileWindow = isMobile && windows.some(w => !w.isMinimized);

  const handleGoHome = useCallback(() => {
    windows.forEach(w => {
      if (!w.isMinimized) minimizeWindow(w.id);
    });
    setMobileAppSwitcherOpen(false);
    setMobileControlCenterOpen(false);
  }, [windows, minimizeWindow]);

  // Sync mobile view state to global store when screen size or mode changes
  useEffect(() => {
    setIsMobileView(detectedMobile);
  }, [detectedMobile, setIsMobileView]);

  // Spotlight: Cmd/Ctrl+K toggles global search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    kernelLog.info('[SYSTEM] App component mounted, checking boot state...');
    const timeout = setTimeout(() => {
      if (!useOS.getState().booted) {
        kernelLog.warn('[SYSTEM] Boot sequence timed out (3s). Forcing UI mount.');
        setBootTimedOut(true);
        setBooted(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [setBooted]);

  useEffect(() => {
    if (isLoggedIn && !hasSeenIntro) {
      useOS.getState().setHasSeenIntro(true);
    }
    // Safety net: ensure registry is loaded on login
    if (isLoggedIn) {
      kernelLog.info('[SYSTEM] User logged in:', currentUser?.name);
      hydrateOSRegistry().catch(() => {});
    }
  }, [isLoggedIn, hasSeenIntro, currentUser]);

  useEffect(() => {
    const homeDir = getDesktopPath(currentUser?.id ?? null);
    if (!vfs.resolveNode(homeDir)) vfs.createDir(homeDir, '__system__');
    
    if (!vfs.resolveNode(`${homeDir}/Trash.lnk`) && !vfs.resolveNode(`${homeDir}/Recycle Bin.lnk`)) {
        vfs.writeFile(`${homeDir}/Trash.lnk`, 'NEXUSOS_APP_SHORTCUT:recyclebin', '__system__');
    }
    
    // Dynamically sync store accent to CSS engine
    

    bindOsStore(() => ({ ...useOS.getState(), windows: useOS.getState().windows }));

    toolForge.bindOsActions(async (action) => {
      const store = useOS.getState();
      switch (action.type) {
        case 'OPEN_APP': {
          const [appId, filePath] = action.args;
          if (!appId) {
            return '[OS::OPEN_APP] -> skipped (missing app id)';
          }
          store.openWindow(appId, filePath ? { path: filePath } : undefined);
          return `[OS::OPEN_APP] -> ✅ "${appId}" opened`;
        }
        case 'NOTIFY': {
          const [title, msg] = action.args;
          store.addNotification({ title: title || 'DAEMON', message: msg || '', type: 'info' });
          return `[OS::NOTIFY] -> ✅ Notification sent`;
        }
        case 'BUILD_APP': {
          const [desc] = action.args;
          store.openWindow('forge', { prompt: desc });
          return `[OS::BUILD_APP] -> ✅ NeuralForge launched for: "${desc}"`;
        }
        case 'OPEN_URL': {
          const [url] = action.args;
          store.openWindow('netrunner', { path: url });
          return `[OS::OPEN_URL] -> ✅ NetRunner opening: ${url}`;
        }
        default:
          return `[OS::${action.type}] -> handled internally`;
      }
    });
  }, [currentUser?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); toggleSearch(); return; }
      if (e.ctrlKey && e.key === 't') { e.preventDefault(); openWindow('terminal'); sounds.windowOpen(); return; }
      if (e.ctrlKey && e.key === 'e') { e.preventDefault(); openWindow('explorer'); sounds.windowOpen(); return; }
      if (e.ctrlKey && e.key === 'l') { e.preventDefault(); lockShell(); return; }
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        const ws = useOS.getState().windows;
        const focusedWindow = ws.at(-1);
        const focused = focusedWindow?.id ?? null;
        if (focused) { closeWindow(focused); sounds.windowClose(); }
        return;
      }
      if (e.ctrlKey && e.key === 'd') { e.preventDefault(); openWindow('dashboard'); sounds.windowOpen(); return; }
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); openWindow('notepad'); sounds.windowOpen(); return; }
      if (e.key === 'F11') {
        e.preventDefault();
        (window as any).electron?.send('toggle-fullscreen');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openWindow, closeWindow, toggleSearch]);

  const handleGlobalClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.context-menu')) return;
    if (!target.closest('.start-menu') && !target.closest('.taskbar') && isStartMenuOpen) toggleStartMenu();
    if (useOS.getState().contextMenu.isOpen) useOS.getState().closeContextMenu();

    // 3DS Parallax: tap = tilt impulsif when clicking/tapping on desktop substrate
    if (
      !target.closest('.window-frame') &&
      !target.closest('.taskbar') &&
      !target.closest('.start-menu') &&
      !target.closest('.context-menu') &&
      !target.closest('button') &&
      !target.closest('input')
    ) {
      triggerImpulse();
    }
  };

  const handleGlobalTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest('.window-frame') &&
      !target.closest('.taskbar') &&
      !target.closest('.start-menu') &&
      !target.closest('.context-menu') &&
      !target.closest('button') &&
      !target.closest('input')
    ) {
      triggerImpulse();
    }
  };

  const handleGlobalContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.taskbar') ||
      target.closest('.start-menu') ||
      target.closest('.window-frame') ||
      target.closest('.context-menu')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'desktop' });
  };

  if (!booted && !bootTimedOut) {
    return <BootScreen />;
  }

  if (!isLoggedIn) {
    return <LoginScreen profiles={profiles} login={login} />;
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden relative"
      onClick={handleGlobalClick}
      onTouchStart={handleGlobalTouchStart}
      onContextMenu={handleGlobalContextMenu}
    >
      <DesktopWallpaper wallpaper={wallpaper} />

      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <DesktopWidgets isMobile={isMobile} />

      <div
        className="absolute inset-0 z-10 overflow-hidden"
        style={uiScale !== 1.0 ? {
          transform: `scale(${uiScale})`,
          transformOrigin: 'top left',
          width: `${100 / uiScale}%`,
          height: `${100 / uiScale}%`,
        } : undefined}
      >
        <DesktopIconGrid
          currentUserId={currentUser?.id ?? null}
          isMobile={isMobile}
          openContextMenu={openContextMenu}
          openWindow={openWindow}
        />

        <div className={`absolute inset-0 ${isMobile ? 'bottom-14' : 'bottom-20'} overflow-hidden pointer-events-none`}>
          {(windows || []).filter(w => w.workspaceId === activeWorkspace || !w.workspaceId).map(win => (
            <WindowFrame key={win.id} windowState={win} />
          ))}
        </div>

        <StartMenu />
        <TaskSwitcher />
        <Taskbar />
      </div>

      <ContextMenu />

      {locked && <LockScreen onUnlock={() => unlockShell()} />}

      {isSearchOpen && (
        <Suspense fallback={null}>
          <GlobalSearchOverlay />
        </Suspense>
      )}

      <DaemonLockScreen />
      <NeuralHoloUI />
      <ToastContainer />

      {/* Spotlight global search — Cmd/Ctrl+K */}
      {spotlightOpen && (
        <Suspense fallback={null}>
          <Spotlight onClose={() => setSpotlightOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
