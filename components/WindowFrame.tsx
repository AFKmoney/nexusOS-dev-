import React, { Suspense, useEffect, useState, type ComponentType } from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Square, Minimize2, Box, Pin, PinOff, Droplet, ChevronLeft } from 'lucide-react';
import { useOS } from '../store/osStore';
import { sounds } from '../kernel/sounds';
import { ErrorBoundary } from './ErrorBoundary';
import CustomAppRunner from '../apps/CustomAppRunner';
import { useMobileDetection } from '../hooks/useMobileDetection';

export const WindowFrame: React.FC<{ windowState: any }> = ({ windowState }) => {
  const {
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    updateWindow,
    activeWindowId,
    openContextMenu,
    registry,
    mobileMode,
    isMobileView: storeIsMobileView
  } = useOS();

  const { isMobile: detectedMobile } = useMobileDetection(mobileMode);
  const isMobile = storeIsMobileView || detectedMobile;

  const [isOpening, setIsOpening] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);

  const isActive = activeWindowId === windowState.id;

  useEffect(() => {
    const t = setTimeout(() => setIsOpening(false), 200);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    sounds.windowClose();
    setTimeout(() => closeWindow(windowState.id), 180);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'window', targetId: windowState.id });
  };

  const app = registry.find(a => a.id === windowState.appId);
  const IconComponent = app?.icon || Box;
  let AppComponent = app?.component as ComponentType<{ windowId: string }> | undefined;

  // Fallback for custom forged and generated apps
  if (!AppComponent && (app?.isCustom || windowState.appId?.startsWith('gen_') || app?.sourcePath)) {
    AppComponent = CustomAppRunner;
  }

  const isMinimized = !!windowState.isMinimized;

  // Window drag bounds — keep title bar visible (top 40px) and within
  // the desktop area (above the taskbar).
  const dragBounds = {
    top: 0,
    left: -windowState.width + 100, // allow partial off-screen left, keep 100px visible
    right: typeof window !== 'undefined' ? window.innerWidth - 100 : 1000,
    bottom: typeof window !== 'undefined' ? window.innerHeight - 48 : 700,
  };

  const effectiveMaximized = isMobile || !!windowState.isMaximized;

  return (
    <Rnd
      size={{
        width: effectiveMaximized ? '100%' : windowState.width,
        height: effectiveMaximized ? '100%' : windowState.height,
      }}
      position={{
        x: effectiveMaximized ? 0 : windowState.x,
        y: effectiveMaximized ? 0 : windowState.y,
      }}
      onDragStop={(e, d) => {
        if (effectiveMaximized) return;
        const clampedX = Math.max(dragBounds.left, Math.min(dragBounds.right, d.x));
        const clampedY = Math.max(dragBounds.top, Math.min(dragBounds.bottom, d.y));
        updateWindow(windowState.id, { x: clampedX, y: clampedY });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (effectiveMaximized) return;
        updateWindow(windowState.id, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          ...position,
        });
      }}
      onDragStart={() => focusWindow(windowState.id)}
      onResizeStart={() => focusWindow(windowState.id)}
      disableDragging={effectiveMaximized || isMinimized}
      enableResizing={!effectiveMaximized && !isMinimized}
      minWidth={isMobile ? 260 : 320}
      minHeight={isMobile ? 180 : 200}
      bounds="parent"
      dragHandleClassName="window-title-bar"
      style={{
        zIndex: alwaysOnTop ? 9999 : windowState.zIndex,
        display: isMinimized ? 'none' : 'flex',
        pointerEvents: isMinimized ? 'none' : 'auto',
        visibility: isMinimized ? 'hidden' : 'visible',
      }}
      className={`window-frame transition-opacity duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100'} ${isMinimized ? 'hidden' : ''} ${isMobile ? '!absolute !inset-0 !w-full !h-full !transform-none' : ''}`}
    >
      <div
        className={`flex flex-col w-full h-full overflow-hidden relative
          ${effectiveMaximized ? 'rounded-none' : 'rounded-xl'}
          ${isActive
            ? 'shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.12)] ring-1 ring-accent/20'
            : 'shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
          }
          bg-[#08080a]/95 backdrop-blur-2xl border border-white/10
        `}
        style={{
          opacity,
          transform: isOpening && !isMobile ? 'scale(0.96) translateY(10px)' : 'scale(1) translateY(0)',
          transition: isOpening && !isMobile ? 'transform 0.2s ease-out, opacity 0.2s ease-out' : 'none',
        }}
      >
        {/* Title Bar - mobile optimized height & touch targets */}
        <div
          onContextMenu={handleContextMenu}
          onDoubleClick={() => !isMobile && toggleMaximizeWindow(windowState.id)}
          className={`window-title-bar ${isMobile ? 'h-11 px-2.5 bg-zinc-950/95 border-b border-white/10' : 'h-11 px-4 border-b border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent'} flex items-center justify-between cursor-default select-none relative z-10 shrink-0`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isMobile && (
              <button
                onClick={() => minimizeWindow(windowState.id)}
                className="flex items-center gap-0.5 py-1 px-2 rounded-xl bg-white/10 active:bg-white/20 text-zinc-100 text-[11px] font-bold shrink-0 transition-all shadow-sm"
                title="Retour à l'accueil"
                aria-label="Retour à l'accueil"
              >
                <ChevronLeft size={16} className="text-accent" />
                <span>Accueil</span>
              </button>
            )}
            <div className={`p-1.5 rounded-lg border border-white/10 transition-colors shrink-0 ${isActive ? 'bg-accent/15 text-accent' : 'bg-black/20 text-zinc-500'}`}>
              <IconComponent size={isMobile ? 15 : 14} className={isActive ? 'drop-shadow-accent' : ''} />
            </div>
            <span className={`font-bold tracking-wide transition-colors truncate ${isMobile ? 'text-xs max-w-[130px] sm:max-w-[200px]' : 'text-xs max-w-[260px]'} ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`}>
              {windowState.title}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
            {/* Desktop only opacity & always-on-top toggles */}
            {!isMobile && (
              <>
                <button
                  onClick={() => setOpacity(o => o === 1 ? 0.7 : o === 0.7 ? 0.4 : 1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                  title="Opacity"
                >
                  <Droplet size={13} />
                </button>
                <button
                  onClick={() => setAlwaysOnTop(!alwaysOnTop)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${alwaysOnTop ? 'bg-accent/15 text-accent' : 'hover:bg-white/10 text-zinc-500 hover:text-white'}`}
                  title="Always on top"
                >
                  {alwaysOnTop ? <Pin size={13} /> : <PinOff size={13} />}
                </button>
                <div className="w-px h-5 bg-white/10 mx-1" />
              </>
            )}

            {/* Minimize */}
            <button
              onClick={() => minimizeWindow(windowState.id)}
              className={`${isMobile ? 'w-9 h-9 active:bg-white/15' : 'w-8 h-8 hover:bg-white/10'} flex items-center justify-center rounded-lg text-zinc-400 hover:text-white transition-colors`}
              title="Minimize"
              aria-label="Minimize Window"
            >
              <Minus size={isMobile ? 18 : 16} />
            </button>

            {/* Maximize / Restore (Desktop only) */}
            {!isMobile && (
              <button
                onClick={() => toggleMaximizeWindow(windowState.id)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                title={windowState.isMaximized ? 'Restore' : 'Maximize'}
                aria-label="Toggle Maximize"
              >
                {windowState.isMaximized ? <Minimize2 size={14} /> : <Square size={12} />}
              </button>
            )}

            {/* Close */}
            <button
              onClick={handleClose}
              className={`${isMobile ? 'w-9 h-9 bg-red-500/10 active:bg-red-500 text-red-400' : 'w-8 h-8 hover:bg-red-500 text-zinc-400'} flex items-center justify-center hover:text-white rounded-lg transition-colors`}
              title="Close"
              aria-label="Close Window"
            >
              <X size={isMobile ? 18 : 16} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 overflow-auto relative bg-transparent min-h-0 custom-scrollbar overscroll-contain"
          onContextMenu={(e) => {
            if (!(e.target as HTMLElement).closest('textarea, input, [contenteditable], .custom-context')) {
              e.preventDefault();
              e.stopPropagation();
              openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'window', targetId: windowState.id });
            }
          }}
        >
          {AppComponent ? (
            <ErrorBoundary appId={windowState.appId} windowId={windowState.id}>
              <Suspense
                fallback={
                  <div className="h-full w-full flex flex-col items-center justify-center text-zinc-500">
                    <Box size={32} className="opacity-30 mb-3 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-widest animate-pulse">Loading…</span>
                  </div>
                }
              >
                <AppComponent windowId={windowState.id} />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-zinc-700">
              <Box size={40} className="opacity-10 mb-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">No Component</span>
            </div>
          )}

          {!isActive && !isMobile && <div className="absolute inset-0 bg-black/5 pointer-events-none" />}
        </div>
      </div>
    </Rnd>
  );
};

