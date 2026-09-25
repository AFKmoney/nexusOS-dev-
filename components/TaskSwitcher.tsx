import React, { useEffect, useState } from 'react';
import { useOS } from '../store/osStore';
import { Box } from 'lucide-react';

export default function TaskSwitcher() {
  const { windows, focusWindow, registry } = useOS();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger with Ctrl + Q
      if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex((prev) => (windows.length > 0 ? (prev + 1) % windows.length : 0));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        if (isOpen) {
          setIsOpen(false);
          const winToFocus = windows[selectedIndex];
          if (winToFocus) {
            focusWindow(winToFocus.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, selectedIndex, windows, focusWindow]);

  if (!isOpen || windows.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-900/95 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-full sm:max-w-3xl flex gap-3 sm:gap-4 overflow-x-auto items-center justify-start sm:justify-center no-scrollbar">
        {windows.map((win, i) => {
          const app = registry.find(a => a.id === win.appId);
          const Icon = app?.icon || Box;
          const isSelected = i === selectedIndex;
          
          return (
            <div 
              key={win.id}
              onClick={() => {
                focusWindow(win.id);
                setIsOpen(false);
              }}
              className={`flex flex-col items-center justify-center w-24 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl transition-all duration-200 cursor-pointer ${
                isSelected ? 'bg-white/10 border border-accent/40 scale-105 shadow-xl ring-1 ring-accent/30' : 'opacity-65 scale-95 border border-white/5 hover:opacity-90'
              }`}
            >
              <Icon size={36} className={`sm:w-12 sm:h-12 ${isSelected ? 'text-accent drop-shadow-accent' : 'text-zinc-500'}`} />
              <div className={`mt-2.5 sm:mt-4 text-xs font-bold text-center truncate w-full px-1.5 ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                {app?.name}
              </div>
              <div className="text-[9px] text-zinc-500 truncate w-full px-1.5 text-center mt-0.5">
                {win.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}