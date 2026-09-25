import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Gamepad2, Pause, Play, RotateCcw, Upload, Bell, Bot, FolderOpen } from 'lucide-react';
import { eventBus, OS_EVENTS } from '../kernel/eventBus';
import { vfs, SYSTEM_VFS_APP_ID } from '../kernel/fileSystem';
import { useOS } from '../store/osStore';
import { useMobileDetection } from '../hooks/useMobileDetection';

const ROM_DIR = '/home/user/Roms';
const GBA_W = 240;
const GBA_H = 160;

type FaceBtn = 'A' | 'B' | 'L' | 'R' | 'START' | 'SELECT';
type DPad = 'U' | 'D' | 'Lft' | 'Rgt';
type PadKey = FaceBtn | DPad;

const KEY_MAP: Record<string, PadKey> = {
  ArrowUp: 'U',
  ArrowDown: 'D',
  ArrowLeft: 'Lft',
  ArrowRight: 'Rgt',
  z: 'A',
  x: 'B',
  a: 'L',
  s: 'R',
  Enter: 'START',
  Shift: 'SELECT',
};

export default function GbaEmulator() {
  const { addNotification } = useOS();
  const { isMobile } = useMobileDetection();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const autoRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const held = useRef<Set<PadKey>>(new Set());
  const pausedByNotif = useRef(false);

  const [romName, setRomName] = useState<string | null>(null);
  const [roms, setRoms] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [autonomous, setAutonomous] = useState(true);
  const [status, setStatus] = useState('AWAITING CART');
  const [heldUi, setHeldUi] = useState<string>('');

  const refreshRoms = useCallback(() => {
    vfs.createDirRecursive(ROM_DIR, SYSTEM_VFS_APP_ID);
    const list = vfs.listDir(ROM_DIR, SYSTEM_VFS_APP_ID) || [];
    setRoms(list.filter((n) => /\.(gba|gbc|gb)$/i.test(n)));
  }, []);

  useEffect(() => {
    refreshRoms();
  }, [refreshRoms]);

  const drawFrame = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#0a1210';
    ctx.fillRect(0, 0, w, h);

    const pulse = 0.5 + 0.5 * Math.sin(t / 400);
    for (let y = 0; y < GBA_H; y += 4) {
      for (let x = 0; x < GBA_W; x += 4) {
        const n = (Math.sin((x + t / 30) * 0.08) + Math.cos((y - t / 40) * 0.07)) * 0.5 + 0.5;
        const g = Math.floor(20 + n * 80 + pulse * 20);
        ctx.fillStyle = `rgb(${g * 0.3},${g},${g * 0.45})`;
        ctx.fillRect(x * (w / GBA_W), y * (h / GBA_H), (w / GBA_W) * 4, (h / GBA_H) * 4);
      }
    }

    ctx.fillStyle = 'rgba(16,185,129,0.85)';
    ctx.font = `${Math.max(10, w / 28)}px monospace`;
    ctx.fillText(romName ? romName.slice(0, 28) : 'NO CART — DEMO FIELD', 8, 18);
    if (autonomous && running) {
      ctx.fillText('DAEMON PLAYING', 8, 34);
    }

    const buttons = Array.from(held.current);
    if (buttons.length) {
      ctx.fillText(buttons.join(' '), 8, h - 10);
    }
  }, [autonomous, romName, running]);

  useEffect(() => {
    if (!running) return;
    const loop = (t: number) => {
      drawFrame(t);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [running, drawFrame]);

  const press = useCallback((key: PadKey, down: boolean) => {
    if (down) held.current.add(key);
    else held.current.delete(key);
    setHeldUi(Array.from(held.current).join(' '));
    eventBus.emit(down ? 'os:gba:press' : 'os:gba:release', { key, rom: romName });
  }, [romName]);

  const loadRom = useCallback((name: string) => {
    const path = `${ROM_DIR}/${name}`;
    const data = vfs.readFile(path, SYSTEM_VFS_APP_ID);
    setRomName(name);
    setRunning(true);
    setStatus(data ? `CART MOUNTED · ${name}` : `CART SLOT · ${name} (empty blob)`);
    eventBus.emit('os:gba:load', { path, name });
    addNotification({ title: 'GBA', message: `Loaded ${name}`, type: 'success' });
  }, [addNotification]);

  const ingestFile = useCallback(async (file: File) => {
    const buf = await file.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf).slice(0, Math.min(buf.byteLength, 256 * 1024))));
    vfs.createDirRecursive(ROM_DIR, SYSTEM_VFS_APP_ID);
    const safe = file.name.replace(/[^\w.\-]+/g, '_');
    vfs.writeFile(`${ROM_DIR}/${safe}`, b64, SYSTEM_VFS_APP_ID);
    refreshRoms();
    loadRom(safe);
  }, [loadRom, refreshRoms]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];
      if (!k) return;
      e.preventDefault();
      press(k, true);
    };
    const up = (e: KeyboardEvent) => {
      const k = KEY_MAP[e.key] || KEY_MAP[e.key.toLowerCase()];
      if (!k) return;
      press(k, false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [press]);

  useEffect(() => {
    const unsubNotif = eventBus.on(OS_EVENTS.NOTIFICATION, () => {
      if (!autonomous) return;
      pausedByNotif.current = true;
      setRunning(false);
      setStatus('PREEMPTED · NOTIFICATION');
    });
    const unsubFocus = eventBus.on(OS_EVENTS.WINDOW_FOCUSED, (payload: unknown) => {
      const p = payload as { appId?: string } | undefined;
      if (p?.appId && p.appId !== 'gba' && autonomous) {
        pausedByNotif.current = true;
        setRunning(false);
        setStatus(`YIELDED · ${p.appId}`);
      }
    });
    const unsubCmd = eventBus.on('os:gba:command', (payload: unknown) => {
      const p = payload as { action?: string; key?: PadKey; rom?: string } | undefined;
      if (!p?.action) return;
      if (p.action === 'play') {
        pausedByNotif.current = false;
        setRunning(true);
        setStatus('DAEMON RESUME');
      }
      if (p.action === 'pause') setRunning(false);
      if (p.action === 'press' && p.key) {
        press(p.key, true);
        setTimeout(() => press(p.key!, false), 80);
      }
      if (p.action === 'load' && p.rom) loadRom(p.rom);
    });
    return () => {
      unsubNotif();
      unsubFocus();
      unsubCmd();
    };
  }, [autonomous, loadRom, press]);

  useEffect(() => {
    if (!autonomous || !running) {
      if (autoRef.current) window.clearInterval(autoRef.current);
      autoRef.current = null;
      return;
    }
    const seq: PadKey[] = ['Rgt', 'Rgt', 'A', 'A', 'U', 'B', 'START', 'Lft'];
    let i = 0;
    autoRef.current = window.setInterval(() => {
      if (pausedByNotif.current) return;
      const k = seq[i % seq.length];
      press(k, true);
      setTimeout(() => press(k, false), 90);
      i += 1;
    }, 280);
    return () => {
      if (autoRef.current) window.clearInterval(autoRef.current);
    };
  }, [autonomous, running, press]);

  const padBtn = (label: string, key: PadKey, extra = '') => (
    <button
      type="button"
      className={`h-11 min-w-[44px] px-3 rounded-xl bg-white/5 border border-white/10 active:bg-accent active:text-black text-[11px] font-black tracking-widest ${extra}`}
      onPointerDown={(e) => { e.preventDefault(); press(key, true); }}
      onPointerUp={(e) => { e.preventDefault(); press(key, false); }}
      onPointerLeave={() => press(key, false)}
    >
      {label}
    </button>
  );

  const scaleClass = useMemo(
    () => (isMobile ? 'max-w-full' : 'max-w-[720px]'),
    [isMobile]
  );

  return (
    <div className="h-full bg-[#05080a] text-white flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 shrink-0">
        <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/20">
          <Gamepad2 size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black uppercase tracking-[0.2em]">GBA Station</div>
          <div className="text-[10px] font-mono text-zinc-500 truncate">{status}</div>
        </div>
        <button
          type="button"
          onClick={() => setAutonomous((v) => !v)}
          className={`h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border ${autonomous ? 'bg-accent text-black border-accent' : 'bg-white/5 border-white/10 text-zinc-400'}`}
        >
          <span className="inline-flex items-center gap-1"><Bot size={12} /> Auto</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col items-center gap-3">
        <div className={`w-full ${scaleClass} rounded-2xl overflow-hidden border border-emerald-500/20 bg-black shadow-[0_0_40px_rgba(16,185,129,0.12)]`}>
          <canvas
            ref={canvasRef}
            width={480}
            height={320}
            className="w-full h-auto block"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <div className="w-full max-w-[720px] flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1"
          >
            {running ? <Pause size={12} /> : <Play size={12} />}
            {running ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => { held.current.clear(); setHeldUi(''); setStatus('RESET'); }}
            className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="h-9 px-3 rounded-lg bg-accent text-black text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1"
          >
            <Upload size={12} /> Load ROM
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".gba,.gbc,.gb"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void ingestFile(f);
            }}
          />
        </div>

        {roms.length > 0 && (
          <div className="w-full max-w-[720px] space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-1">
              <FolderOpen size={11} /> VFS {ROM_DIR}
            </div>
            {roms.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => loadRom(n)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono border ${romName === n ? 'border-accent bg-accent/10 text-accent' : 'border-white/5 bg-white/5 text-zinc-300'}`}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        <div className={`w-full max-w-[720px] grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'} items-center pb-4`}>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">{padBtn('↑', 'U')}</div>
            <div className="flex gap-2">
              {padBtn('←', 'Lft')}
              {padBtn('↓', 'D')}
              {padBtn('→', 'Rgt')}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              {padBtn('L', 'L')}
              {padBtn('R', 'R')}
            </div>
            <div className="flex gap-2">
              {padBtn('B', 'B')}
              {padBtn('A', 'A')}
            </div>
            <div className="flex gap-2">
              {padBtn('SEL', 'SELECT')}
              {padBtn('ST', 'START')}
            </div>
          </div>
        </div>

        <div className="w-full max-w-[720px] text-[10px] text-zinc-500 font-mono flex items-start gap-2 px-1">
          <Bell size={12} className="shrink-0 mt-0.5 text-accent" />
          <span>
            Auto yields on notifications and foreign window focus. DAEMON drives pads via os:gba:command. Desktop: arrows + Z/X.
            {heldUi ? ` · held ${heldUi}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
