import React, { useState, useEffect } from 'react';
import { useOS } from '../store/osStore';
import { useSystemControls } from '../hooks/useSystemControls';
import { notificationQueue } from '../kernel/notificationQueue';
import { Wifi, WifiOff, BatteryFull, BatteryCharging, Bell, Zap, Box } from 'lucide-react';

interface MobileStatusBarProps {
  onOpenNotifications?: () => void;
  onOpenControlCenter?: () => void;
  onDynamicPillClick?: () => void;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  onOpenNotifications,
  onOpenControlCenter,
  onDynamicPillClick,
}) => {
  const { windows, activeWindowId, registry, kernelRules, openWindow } = useOS();
  const { isOnline, batteryLevel, isCharging } = useSystemControls();
  const [time, setTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setUnreadCount(notificationQueue.getUnreadCount());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeWindow = windows.find(w => w.id === activeWindowId && !w.isMinimized);
  const activeApp = activeWindow ? registry.find(a => a.id === activeWindow.appId) : null;
  const ActiveIcon = activeApp?.icon || Box;

  return (
    <header className="fixed top-0 left-0 right-0 h-9 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/10 px-3.5 flex items-center justify-between text-white select-none pointer-events-auto">
      {/* Left: Time & OS Name */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs font-black tracking-tight tabular-nums text-zinc-100">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-[10px] font-bold text-accent/80 tracking-widest hidden xs:inline">
          NEXUS
        </span>
      </div>

      {/* Center: Dynamic Island status pill */}
      <div
        onClick={() => {
          if (onDynamicPillClick) onDynamicPillClick();
          else if (activeWindow) {
            // Already active or focus window
          }
        }}
        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[11px] font-semibold max-w-[170px] truncate shadow-sm active:scale-95 transition-all cursor-pointer"
      >
        {activeApp ? (
          <>
            <ActiveIcon size={12} className="text-accent shrink-0" />
            <span className="truncate text-zinc-200 text-[10px]">{activeApp.name}</span>
          </>
        ) : kernelRules.autonomyEnabled ? (
          <>
            <Zap size={11} className="text-accent animate-pulse shrink-0" />
            <span className="text-accent font-bold text-[10px] tracking-wide">IA Active</span>
          </>
        ) : (
          <span className="text-zinc-400 font-bold text-[10px] tracking-wider uppercase">
            {time.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {/* Right: Connectivity & Battery & Alerts */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Network */}
        <div className="flex items-center text-zinc-400" title={isOnline ? 'En ligne' : 'Hors-ligne'}>
          {isOnline ? (
            <Wifi size={13} className="text-accent" />
          ) : (
            <WifiOff size={13} className="text-red-400" />
          )}
        </div>

        {/* Battery */}
        <div className="flex items-center gap-1">
          {isCharging ? (
            <BatteryCharging size={14} className="text-accent" />
          ) : (
            <BatteryFull
              size={14}
              className={batteryLevel <= 20 ? 'text-rose-400' : 'text-zinc-300'}
            />
          )}
          <span
            className={`text-[10px] font-mono font-bold ${
              batteryLevel <= 20 ? 'text-rose-400' : 'text-zinc-300'
            }`}
          >
            {batteryLevel}%
          </span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => {
            if (onOpenNotifications) onOpenNotifications();
            else openWindow('notifications');
          }}
          className="relative p-1 rounded-md text-zinc-400 active:text-white"
          aria-label="Notifications"
        >
          <Bell size={13} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};

export default MobileStatusBar;
