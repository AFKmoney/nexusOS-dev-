import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Gamepad2, Pause, Play, RotateCcw, Upload, Bell, Bot, FolderOpen, Cpu, Save } from 'lucide-react';
import { eventBus, OS_EVENTS } from '../kernel/eventBus';
import { vfs, SYSTEM_VFS_APP_ID } from '../kernel/fileSystem';
import { useOS } from '../store/osStore';
import { useMobileDetection } from '../hooks/useMobileDetection';

const ROM_DIR = '/home/user/Roms';
const SAVE_DIR = '/home/user/Roms/saves';
const BIOS_PATH = '/home/user/Roms/gba_bios.bin';

type PadKey = 'A' | 'B' | 'L' | 'R' | 'START' | 'SELECT' | 'U' | 'D' | 'Lft' | 'Rgt';
const KEY_MAP: Record<string, PadKey> = {
  ArrowUp: 'U', ArrowDown: 'D', ArrowLeft: 'Lft', ArrowRight: 'Rgt',
  z: 'A', x: 'B', a: 'L', s: 'R', Enter: 'START', Shift: 'SELECT',
};

function u8ToB64(u8: Uint8Array): string {
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) s += String.fromCharCode(...u8.subarray(i, i + chunk));
  return btoa(s);
}
function b64ToU8(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export default function GbaEmulator() {
  const { addNotification } = useOS();
  const { isMobile } = useMobileDetection();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const biosRef = useRef<HTMLInputElement | null>(null);
  const autoRef = useRef<number | null>(null);
  const pausedByNotif = useRef(false);
  const held = useRef<Set<PadKey>>(new Set());
  const [coreReady, setCoreReady] = useState(false);
  const [coreError, setCoreError] = useState<string | null>(null);
  const [romName, setRomName] = useState<string | null>(null);
  const [roms, setRoms] = useState<string[]>([]);
  const [saves, setSaves] = useState<string[]>([]);
  const [hasBios, setHasBios] = useState(false);
  const [running, setRunning] = useState(false);
  const [autonomous, setAutonomous] = useState(true);
  const [status, setStatus] = useState('BOOTING IODINE CORE');

  const postCore = useCallback((msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage({ __nexusGba: true, ...msg }, '*');
  }, []);

  const refreshRoms = useCallback(() => {
    vfs.createDirRecursive(ROM_DIR, SYSTEM_VFS_APP_ID);
    vfs.createDirRecursive(SAVE_DIR, SYSTEM_VFS_APP_ID);
    const list = vfs.listDir(ROM_DIR, SYSTEM_VFS_APP_ID) || [];
    setRoms(list.filter((n) => /\.(gba|gbc|gb)$/i.test(n)));
    const saveList = vfs.listDir(SAVE_DIR, SYSTEM_VFS_APP_ID) || [];
    setSaves(saveList.filter((n) => /\.(sav|srm)$/i.test(n)));
    const bios = vfs.readFile(BIOS_PATH, SYSTEM_VFS_APP_ID);
    setHasBios(Boolean(bios && bios.length > 100));
  }, []);

  useEffect(() => { refreshRoms(); }, [refreshRoms]);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      const d = ev.data;
      if (!d || d.__nexusGba !== true) return;
      if (d.kind === 'ready') {
        setCoreReady(true);
        setStatus('CORE READY \u00b7 NEED BIOS + ROM');
        const bios = vfs.readFile(BIOS_PATH, SYSTEM_VFS_APP_ID);
        if (bios) {
          try { postCore({ cmd: 'bios', bytes: Array.from(b64ToU8(bios)) }); setHasBios(true); } catch { /* ignore */ }
        }
      }
      if (d.kind === 'error') { setCoreError(String(d.message || 'core error')); setStatus('CORE ERROR'); }
      if (d.kind === 'rom') setStatus(`CART ${d.name || ''} \u00b7 ${d.size || 0} bytes`);
      if (d.kind === 'bios') setStatus(`BIOS ${d.size || 0} bytes`);
      if (d.kind === 'save') {
        const bytes = new Uint8Array(d.bytes || []);
        if (bytes.length === 0) { setStatus('SAVE EMPTY \u00b7 play first'); return; }
        const base = String(d.name || 'cart').replace(/[^\w.\-]+/g, '_');
        const file = `${base}.sav`;
        vfs.createDirRecursive(SAVE_DIR, SYSTEM_VFS_APP_ID);
        vfs.writeFile(`${SAVE_DIR}/${file}`, u8ToB64(bytes), SYSTEM_VFS_APP_ID);
        setStatus(`SAVED ${file} \u00b7 ${bytes.length} bytes`);
        refreshRoms();
      }
      if (d.kind === 'loadsave') setStatus(`SAVE LOADED \u00b7 ${d.size || 0} bytes`);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [postCore, refreshRoms]);

  const press = useCallback((key: PadKey, down: boolean) => {
    if (down) held.current.add(key); else held.current.delete(key);
    postCore({ cmd: down ? 'down' : 'up', key });
    eventBus.emit(down ? OS_EVENTS.GBA_PRESS : OS_EVENTS.GBA_RELEASE, { key, rom: romName });
  }, [postCore, romName]);

  const play = useCallback(() => {
    pausedByNotif.current = false;
    postCore({ cmd: 'play' });
    setRunning(true);
    setStatus('CORE RUNNING');
  }, [postCore]);

  const pause = useCallback(() => {
    postCore({ cmd: 'pause' });
    setRunning(false);
    setStatus('PAUSED');
  }, [postCore]);

  const attachRomBytes = useCallback((name: string, bytes: Uint8Array) => {
    setRomName(name);
    postCore({ cmd: 'rom', name, bytes: Array.from(bytes) });
    eventBus.emit(OS_EVENTS.GBA_LOAD, { name, size: bytes.length });
    play();
    addNotification({ title: 'GBA', message: `Loaded ${name} (${bytes.length} bytes)`, type: 'success' });
  }, [addNotification, play, postCore]);

  const ingestRomFile = useCallback(async (file: File) => {
    const buf = new Uint8Array(await file.arrayBuffer());
    const safe = file.name.replace(/[^\w.\-]+/g, '_');
    vfs.createDirRecursive(ROM_DIR, SYSTEM_VFS_APP_ID);
    if (buf.length <= 512 * 1024) vfs.writeFile(`${ROM_DIR}/${safe}`, u8ToB64(buf), SYSTEM_VFS_APP_ID);
    refreshRoms();
    attachRomBytes(safe, buf);
  }, [attachRomBytes, refreshRoms]);

  const ingestBiosFile = useCallback(async (file: File) => {
    const buf = new Uint8Array(await file.arrayBuffer());
    vfs.createDirRecursive(ROM_DIR, SYSTEM_VFS_APP_ID);
    vfs.writeFile(BIOS_PATH, u8ToB64(buf), SYSTEM_VFS_APP_ID);
    postCore({ cmd: 'bios', bytes: Array.from(buf) });
    setHasBios(true);
    setStatus(`BIOS MOUNTED \u00b7 ${buf.length} bytes`);
    addNotification({ title: 'GBA', message: 'BIOS attached (not redistributed).', type: 'success' });
  }, [addNotification, postCore]);

  const loadRomFromVfs = useCallback((name: string) => {
    const raw = vfs.readFile(`${ROM_DIR}/${name}`, SYSTEM_VFS_APP_ID);
    if (!raw) { setStatus(`VFS MISS \u00b7 ${name}`); return; }
    try { attachRomBytes(name, b64ToU8(raw)); } catch { setStatus(`VFS DECODE FAIL \u00b7 ${name}`); }
  }, [attachRomBytes]);

  const requestSave = useCallback(() => {
    if (!romName) { setStatus('NO CART \u00b7 cannot save'); return; }
    postCore({ cmd: 'save', name: romName.replace(/\.(gba|gbc|gb)$/i, '') });
  }, [postCore, romName]);

  const loadSave = useCallback((name: string) => {
    const raw = vfs.readFile(`${SAVE_DIR}/${name}`, SYSTEM_VFS_APP_ID);
    if (!raw) { setStatus(`SAVE MISS \u00b7 ${name}`); return; }
    try { postCore({ cmd: 'loadsave', bytes: Array.from(b64ToU8(raw)) }); setStatus(`LOADING SAVE \u00b7 ${name}`); }
    catch { setStatus(`SAVE DECODE FAIL \u00b7 ${name}`); }
  }, [postCore]);

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
      pause();
      setStatus('PREEMPTED \u00b7 NOTIFICATION');
    });
    const unsubFocus = eventBus.on(OS_EVENTS.WINDOW_FOCUSED, (payload: unknown) => {
      const p = payload as { appId?: string } | undefined;
      if (p?.appId && p.appId !== 'gba' && autonomous) {
        pausedByNotif.current = true;
        pause();
        setStatus(`YIELDED \u00b7 ${p.appId}`);
      }
    });
    const unsubCmd = eventBus.on(OS_EVENTS.GBA_COMMAND, (payload: unknown) => {
      const p = payload as { action?: string; key?: PadKey; rom?: string } | undefined;
      if (!p?.action) return;
      if (p.action === 'play') play();
      if (p.action === 'pause') pause();
      if (p.action === 'press' && p.key) {
        press(p.key, true);
        window.setTimeout(() => press(p.key!, false), 80);
      }
      if (p.action === 'load' && p.rom) loadRomFromVfs(p.rom);
      if (p.action === 'save') requestSave();
      if (p.action === 'loadsave' && p.rom) loadSave(p.rom);
    });
    return () => { unsubNotif(); unsubFocus(); unsubCmd(); };
  }, [autonomous, loadRomFromVfs, loadSave, pause, play, press, requestSave]);

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
      window.setTimeout(() => press(k, false), 90);
      i += 1;
    }, 280);
    return () => { if (autoRef.current) window.clearInterval(autoRef.current); };
  }, [autonomous, running, press]);

  const padBtn = (label: string, key: PadKey) => (
    <button type="button" className="h-11 min-w-[44px] px-3 rounded-xl bg-white/5 border border-white/10 active:bg-accent active:text-black text-[11px] font-black tracking-widest" onPointerDown={(e) => { e.preventDefault(); press(key, true); }} onPointerUp={(e) => { e.preventDefault(); press(key, false); }} onPointerLeave={() => press(key, false)}>{label}</button>
  );

  const scaleClass = useMemo(() => (isMobile ? 'max-w-full' : 'max-w-[720px]'), [isMobile]);

  return (
    <div className="h-full bg-[#05080a] text-white flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 shrink-0">
        <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/20"><Gamepad2 size={16} /></div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black uppercase tracking-[0.2em]">GBA Station</div>
          <div className="text-[10px] font-mono text-zinc-500 truncate">{status}</div>
        </div>
        <span className={`text-[9px] font-mono px-2 py-1 rounded-md border ${coreReady ? 'border-accent/40 text-accent' : 'border-white/10 text-zinc-500'}`}>
          <Cpu size={10} className="inline mr-1" />{coreReady ? 'IODINE' : 'BOOT'}
        </span>
        <button type="button" onClick={() => setAutonomous((v) => !v)} className={`h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border ${autonomous ? 'bg-accent text-black border-accent' : 'bg-white/5 border-white/10 text-zinc-400'}`}>
          <span className="inline-flex items-center gap-1"><Bot size={12} /> Auto</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col items-center gap-3">
        <div className={`w-full ${scaleClass} rounded-2xl overflow-hidden border border-emerald-500/20 bg-black`} style={{ aspectRatio: '3 / 2' }}>
          <iframe ref={iframeRef} src="/gba-host.html" title="iodine-gba-core" className="w-full h-full border-0 bg-black" sandbox="allow-scripts" />
        </div>
        {coreError && <div className="w-full max-w-[720px] text-[10px] font-mono text-amber-400">{coreError}</div>}
        <div className="w-full max-w-[720px] flex flex-wrap gap-2 justify-center">
          <button type="button" onClick={() => (running ? pause() : play())} className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">{running ? <Pause size={12} /> : <Play size={12} />}{running ? 'Pause' : 'Play'}</button>
          <button type="button" onClick={() => { postCore({ cmd: 'stop' }); setRunning(false); setStatus('RESET'); }} className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1"><RotateCcw size={12} /> Reset</button>
          <button type="button" onClick={() => biosRef.current?.click()} className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">{hasBios ? 'BIOS OK' : 'Load BIOS'}</button>
          <button type="button" onClick={() => fileRef.current?.click()} className="h-9 px-3 rounded-lg bg-accent text-black text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1"><Upload size={12} /> Load ROM</button>
          <button type="button" onClick={requestSave} className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1"><Save size={12} /> Save</button>
          <input ref={fileRef} type="file" accept=".gba,.gbc,.gb" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void ingestRomFile(f); }} />
          <input ref={biosRef} type="file" accept=".bin,.bios" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void ingestBiosFile(f); }} />
        </div>
        {roms.length > 0 && (
          <div className="w-full max-w-[720px] space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-1"><FolderOpen size={11} /> VFS {ROM_DIR}</div>
            {roms.map((n) => (
              <button key={n} type="button" onClick={() => loadRomFromVfs(n)} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono border ${romName === n ? 'border-accent bg-accent/10 text-accent' : 'border-white/5 bg-white/5 text-zinc-300'}`}>{n}</button>
            ))}
          </div>
        )}
        {saves.length > 0 && (
          <div className="w-full max-w-[720px] space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-1"><Save size={11} /> VFS {SAVE_DIR}</div>
            {saves.map((n) => (
              <button key={n} type="button" onClick={() => loadSave(n)} className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono border border-white/5 bg-white/5 text-zinc-300">{n}</button>
            ))}
          </div>
        )}
        <div className={`w-full max-w-[720px] grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'} items-center pb-4`}>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">{padBtn('↑', 'U')}</div>
            <div className="flex gap-2">{padBtn('←', 'Lft')}{padBtn('↓', 'D')}{padBtn('→', 'Rgt')}</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">{padBtn('L', 'L')}{padBtn('R', 'R')}</div>
            <div className="flex gap-2">{padBtn('B', 'B')}{padBtn('A', 'A')}</div>
            <div className="flex gap-2">{padBtn('SEL', 'SELECT')}{padBtn('ST', 'START')}</div>
          </div>
        </div>
        <div className="w-full max-w-[720px] text-[10px] text-zinc-500 font-mono flex items-start gap-2 px-1">
          <Bell size={12} className="shrink-0 mt-0.5 text-accent" />
          <span>Menu Nexus → Games / Media / All. Load BIOS + ROM. Save writes /home/user/Roms/saves/*.sav</span>
        </div>
      </div>
    </div>
  );
}
