import React, { useEffect, useState } from 'react';
import { Search, Send, ChevronDown } from 'lucide-react';
import { eventBus, OS_EVENTS } from '../kernel/eventBus';
import { XLogo } from '../components/XLogo';
import {
  loadXCredentials,
  saveXCredentials,
  xPost,
  xSearch,
  xProfileUrl,
  openRealX,
  type XPost as XPostItem,
} from '../kernel/xBridge';

export default function XApp() {
  const [creds, setCreds] = useState(loadXCredentials);
  const [token, setToken] = useState(creds.userAccessToken || creds.bearerToken || '');
  const [handle, setHandle] = useState(creds.handle || '');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [posts, setPosts] = useState<XPostItem[]>([]);
  const [status, setStatus] = useState('');
  const [keysOpen, setKeysOpen] = useState(false);
  const connected = Boolean(creds.bearerToken || creds.userAccessToken);

  useEffect(() => {
    const off = eventBus.on(OS_EVENTS.X_RESULTS, (payload) => {
      const p = (payload || {}) as { posts?: XPostItem[]; kind?: string; id?: string };
      if (p.posts) setPosts(p.posts);
      if (p.kind === 'post' && p.id) setStatus(`Live · ${p.id}`);
    });
    return off;
  }, []);

  const saveCreds = () => {
    const next = {
      ...creds,
      handle: handle.replace(/^@/, ''),
      userAccessToken: token.trim() || undefined,
      bearerToken: token.trim() || undefined,
    };
    saveXCredentials(next);
    setCreds(next);
    setKeysOpen(false);
    setStatus(token.trim() ? 'Ready' : 'Signed out');
  };

  const runSearch = async () => {
    if (!query.trim()) return;
    const res = await xSearch(query.trim());
    setPosts(res.posts);
    setStatus(res.posts.length ? `${res.posts.length}` : 'Opened X');
  };

  const runPost = async () => {
    if (!draft.trim()) return;
    const res = await xPost(draft.trim());
    if (res.ok) {
      setDraft('');
      setStatus(res.id ? `Live · ${res.id}` : 'Posted');
    } else {
      setStatus('Compose opened');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-white">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <button
          onClick={() => openRealX('https://x.com/home')}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Open X"
        >
          <XLogo size={18} />
        </button>
        <div className="text-[11px] tracking-[0.28em] font-semibold uppercase text-zinc-500">
          {connected ? `@${creds.handle || 'you'}` : 'guest'}
        </div>
        <button
          onClick={() => setKeysOpen((v) => !v)}
          className="w-10 h-10 rounded-full border border-white/10 text-zinc-500 flex items-center justify-center"
        >
          <ChevronDown size={16} className={keysOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      </div>

      {keysOpen && (
        <div className="px-4 pb-3 space-y-2">
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="handle"
            className="w-full bg-transparent border-b border-white/10 py-2 text-sm outline-none focus:border-white/40"
          />
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="access token"
            className="w-full bg-transparent border-b border-white/10 py-2 text-sm outline-none focus:border-white/40"
          />
          <button onClick={saveCreds} className="text-[11px] tracking-widest uppercase text-zinc-400">
            save
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); void runSearch(); }}
        className="mx-4 mb-3 flex items-center gap-2 h-11 rounded-full bg-zinc-950 border border-white/8 px-4"
      >
        <Search size={15} className="text-zinc-600 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600"
        />
      </form>

      <div className="flex-1 overflow-y-auto px-4 space-y-3 min-h-0">
        <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 280))}
            placeholder="What's happening?"
            rows={4}
            className="w-full bg-transparent text-[15px] leading-relaxed outline-none resize-none placeholder:text-zinc-600"
          />
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] tabular-nums text-zinc-600">{draft.length}</span>
            <button
              onClick={() => void runPost()}
              disabled={!draft.trim()}
              className="h-8 px-4 rounded-full bg-white text-black text-[12px] font-bold disabled:opacity-25 active:scale-95 transition"
            >
              Post
            </button>
          </div>
        </div>

        {posts.map((p) => (
          <button
            key={p.id}
            onClick={() => openRealX(p.url)}
            className="w-full text-left py-3 border-b border-white/5"
          >
            <p className="text-[14px] leading-snug text-zinc-200">{p.text}</p>
          </button>
        ))}
      </div>

      <div className="px-4 py-3 flex items-center justify-between text-[11px] text-zinc-600 border-t border-white/5">
        <span className="truncate">{status || 'Opens real X'}</span>
        <button onClick={() => openRealX(handle ? xProfileUrl(handle) : 'https://x.com/home')} className="flex items-center gap-1 text-zinc-400">
          <Send size={11} /> open
        </button>
      </div>
    </div>
  );
}
