import React, { useEffect, useState } from 'react';
import { Search, Send, User, KeyRound, ExternalLink, Home } from 'lucide-react';
import { useOS } from '../store/osStore';
import { eventBus, OS_EVENTS } from '../kernel/eventBus';
import {
  loadXCredentials,
  saveXCredentials,
  xPost,
  xSearch,
  xProfileUrl,
  openRealX,
  type XPost as XPostItem,
} from '../kernel/xBridge';

export default function XApp({ windowId }: { windowId: string }) {
  const { windows, isMobileView } = useOS();
  const win = windows.find((w) => w.id === windowId);
  const initialPath = String(win?.data?.path || 'https://x.com/home');

  const [creds, setCreds] = useState(loadXCredentials);
  const [token, setToken] = useState(creds.userAccessToken || creds.bearerToken || '');
  const [handle, setHandle] = useState(creds.handle || '');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [posts, setPosts] = useState<XPostItem[]>([]);
  const [status, setStatus] = useState('X bloque les iframes. DAEMON ouvre le vrai X.');
  const [lastUrl, setLastUrl] = useState(initialPath);

  useEffect(() => {
    const off = eventBus.on(OS_EVENTS.X_COMMAND, (payload) => {
      const p = (payload || {}) as { path?: string; action?: string; query?: string; text?: string; handle?: string };
      if (p.path) setLastUrl(p.path);
      if (p.action === 'search' && p.query) setQuery(p.query);
      if (p.action === 'post' && p.text) setDraft(p.text);
    });
    const offRes = eventBus.on(OS_EVENTS.X_RESULTS, (payload) => {
      const p = (payload || {}) as { posts?: XPostItem[]; kind?: string; id?: string };
      if (p.posts) setPosts(p.posts);
      if (p.kind === 'post' && p.id) setStatus(`Posted on real X · ${p.id}`);
    });
    return () => { off(); offRes(); };
  }, []);

  const connected = Boolean(creds.bearerToken || creds.userAccessToken);

  const saveCreds = () => {
    const next = {
      ...creds,
      handle: handle.replace(/^@/, ''),
      userAccessToken: token.trim() || undefined,
      bearerToken: token.trim() || undefined,
    };
    saveXCredentials(next);
    setCreds(next);
    setStatus(token.trim() ? 'Token saved locally. DAEMON can post on real X.' : 'Token cleared.');
  };

  const runSearch = async (q = query) => {
    if (!q.trim()) return;
    setStatus('Searching real X…');
    const res = await xSearch(q.trim());
    setPosts(res.posts);
    if (res.fallback) {
      setLastUrl(res.fallback);
      setStatus('Opened real X search');
    } else {
      setStatus(`${res.posts.length} posts from X API`);
    }
  };

  const runPost = async (text = draft) => {
    if (!text.trim()) return;
    setStatus('Posting to real X…');
    const res = await xPost(text.trim());
    if (res.ok) {
      setStatus(res.id ? `Live on X · ${res.id}` : 'Posted on real X');
      setDraft('');
    } else {
      if (res.fallback) setLastUrl(res.fallback);
      setStatus(res.error || 'Opened real X compose');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050508] text-zinc-100">
      <div className="px-3 sm:px-4 py-2.5 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black text-sm shrink-0">𝕏</div>
          <div className="min-w-0">
            <div className="text-sm font-black tracking-widest uppercase">X Control</div>
            <div className="text-[10px] text-zinc-500 truncate">
              {connected ? `@${creds.handle || 'api'}` : 'no token · opens the real X app/site'}
            </div>
          </div>
        </div>
        <button
          onClick={() => { setLastUrl('https://x.com/home'); openRealX('https://x.com/home'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-[11px] font-black uppercase"
        >
          <ExternalLink size={12} /> Open X
        </button>
      </div>

      <div className="px-3 py-2 text-[11px] text-zinc-400 border-b border-white/5">
        x.com refuse l’embed. Cette fenêtre commande le <span className="text-white">vrai X</span>
        {lastUrl ? <> · {lastUrl.replace('https://', '')}</> : null}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className={`p-3 grid gap-2 ${isMobileView ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <button onClick={() => openRealX('https://x.com/home')} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold"><Home size={13} /> Home</button>
          <button onClick={() => openRealX(handle ? xProfileUrl(handle) : 'https://x.com/RPANOLIMIT')} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold"><User size={13} /> Profile</button>
          <button onClick={() => query && void runSearch()} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold"><Search size={13} /> Search</button>
          <button onClick={() => draft && void runPost()} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold"><Send size={13} /> Post</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); void runSearch(); }} className="px-3 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search X"
            className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent/40"
          />
          <button type="submit" className="px-3 rounded-lg bg-white/10 text-xs font-bold">Go</button>
        </form>

        <div className="p-3 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 280))}
            placeholder="What's happening?"
            rows={3}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-accent/40 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-600">{draft.length}/280</span>
            <button onClick={() => void runPost()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-[11px] font-black uppercase">
              <Send size={12} /> Post
            </button>
          </div>
        </div>

        <div className="px-3 pb-3 space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 flex items-center gap-1"><KeyRound size={12} /> Local token</div>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@handle"
            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none"
          />
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="X user access token"
            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none"
          />
          <button onClick={saveCreds} className="w-full py-1.5 rounded-lg bg-white/10 text-[11px] font-bold">Save on this phone</button>
        </div>

        <div className="px-3 pb-4 space-y-2">
          {posts.map((p) => (
            <button
              key={p.id}
              onClick={() => openRealX(p.url)}
              className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="text-[11px] text-zinc-200 leading-relaxed">{p.text}</div>
              <div className="text-[10px] text-accent mt-1">Open on X</div>
            </button>
          ))}
        </div>
      </div>
      {status && <div className="px-3 py-2 text-[10px] text-accent border-t border-white/5 truncate">{status}</div>}
    </div>
  );
}
