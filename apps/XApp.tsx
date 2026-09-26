import React, { useEffect, useMemo, useState } from 'react';
import { Search, Send, User, KeyRound, ExternalLink, RefreshCw } from 'lucide-react';
import { useOS } from '../store/osStore';
import { eventBus, OS_EVENTS } from '../kernel/eventBus';
import {
  loadXCredentials,
  saveXCredentials,
  xPost,
  xSearch,
  xProfileUrl,
  xComposeUrl,
  type XPost as XPostItem,
} from '../kernel/xBridge';

export default function XApp({ windowId }: { windowId: string }) {
  const { windows, isMobileView } = useOS();
  const win = windows.find((w) => w.id === windowId);
  const initialPath = String(win?.data?.path || '');

  const [creds, setCreds] = useState(loadXCredentials);
  const [token, setToken] = useState(creds.userAccessToken || creds.bearerToken || '');
  const [handle, setHandle] = useState(creds.handle || '');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [posts, setPosts] = useState<XPostItem[]>([]);
  const [status, setStatus] = useState('');
  const [embed, setEmbed] = useState(initialPath || 'https://x.com/home');

  useEffect(() => {
    if (initialPath) setEmbed(initialPath);
  }, [initialPath]);

  useEffect(() => {
    const offCmd = eventBus.on(OS_EVENTS.X_COMMAND, (payload) => {
      const p = (payload || {}) as { action?: string; query?: string; text?: string; path?: string; handle?: string };
      if (p.path) setEmbed(p.path);
      if (p.action === 'search' && p.query) {
        setQuery(p.query);
        void runSearch(p.query);
      }
      if (p.action === 'post' && p.text) {
        setDraft(p.text);
        void runPost(p.text);
      }
      if (p.action === 'profile' && p.handle) setEmbed(xProfileUrl(p.handle));
      if (p.action === 'timeline') setEmbed(handle ? xProfileUrl(handle) : 'https://x.com/home');
    });
    const offRes = eventBus.on(OS_EVENTS.X_RESULTS, (payload) => {
      const p = (payload || {}) as { kind?: string; posts?: XPostItem[] };
      if (p.posts) setPosts(p.posts);
    });
    return () => { offCmd(); offRes(); };
  }, [handle]);

  const connected = Boolean(creds.bearerToken || creds.userAccessToken);

  const saveCreds = () => {
    const next = { ...creds, handle: handle.replace(/^@/, ''), userAccessToken: token.trim() || undefined, bearerToken: token.trim() || undefined };
    saveXCredentials(next);
    setCreds(next);
    setStatus(token.trim() ? 'Token saved locally (not in git).' : 'Token cleared.');
  };

  const runSearch = async (q = query) => {
    if (!q.trim()) return;
    setStatus('Searching…');
    const res = await xSearch(q.trim());
    setPosts(res.posts);
    if (res.fallback) setEmbed(res.fallback);
    setStatus(res.posts.length ? `${res.posts.length} posts` : res.fallback ? 'Opened X search' : 'No results');
  };

  const runPost = async (text = draft) => {
    if (!text.trim()) return;
    setStatus('Posting…');
    const res = await xPost(text.trim());
    if (res.ok) {
      setStatus(res.id ? `Posted ${res.id}` : 'Posted');
      setDraft('');
    } else {
      if (res.fallback) setEmbed(res.fallback);
      setStatus(res.error || 'Opened compose');
    }
  };

  const frameSrc = useMemo(() => embed, [embed]);

  return (
    <div className="h-full flex flex-col bg-[#050508] text-zinc-100">
      <div className="px-3 sm:px-4 py-2.5 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black text-sm shrink-0">𝕏</div>
          <div className="min-w-0">
            <div className="text-sm font-black tracking-widest uppercase">X</div>
            <div className="text-[10px] text-zinc-500 truncate">{connected ? `@${creds.handle || 'connected'}` : 'guest — paste a token to post via API'}</div>
          </div>
        </div>
        <a href={frameSrc} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-white/10 text-zinc-400">
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row min-h-0">
        <div className={`${isMobileView ? 'w-full border-b max-h-[46%]' : 'w-80 border-r'} border-white/10 flex flex-col shrink-0 bg-black/30`}>
          <form
            onSubmit={(e) => { e.preventDefault(); void runSearch(); }}
            className="p-3 border-b border-white/5 flex gap-2"
          >
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search X"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-accent/40"
              />
            </div>
            <button type="submit" className="px-3 rounded-lg bg-white/10 text-xs font-bold">Go</button>
          </form>

          <div className="p-3 border-b border-white/5 space-y-2">
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

          <div className="p-3 border-b border-white/5 space-y-2">
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
              placeholder="Bearer / user access token"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs outline-none"
            />
            <button onClick={saveCreds} className="w-full py-1.5 rounded-lg bg-white/10 text-[11px] font-bold">Save on this machine</button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 min-h-0">
            {posts.map((p) => (
              <button
                key={p.id}
                onClick={() => setEmbed(p.url)}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15"
              >
                <div className="text-[11px] text-zinc-200 leading-relaxed">{p.text}</div>
                <div className="text-[10px] text-zinc-600 mt-1 truncate">{p.url}</div>
              </button>
            ))}
            {!posts.length && <div className="text-[11px] text-zinc-600">Search or let DAEMON call x_search.</div>}
          </div>
          {status && <div className="px-3 py-2 text-[10px] text-accent border-t border-white/5 truncate">{status}</div>}
        </div>

        <div className="flex-1 min-h-0 bg-black relative">
          <iframe title="X" src={frameSrc} className="w-full h-full border-0 bg-black" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" />
          <div className="absolute top-2 right-2 flex gap-1">
            <button onClick={() => setEmbed('https://x.com/home')} className="p-1.5 rounded-lg bg-black/70 border border-white/10" title="Home"><RefreshCw size={12} /></button>
            <button onClick={() => handle && setEmbed(xProfileUrl(handle))} className="p-1.5 rounded-lg bg-black/70 border border-white/10" title="Profile"><User size={12} /></button>
            <button onClick={() => setEmbed(xComposeUrl(draft || ''))} className="p-1.5 rounded-lg bg-black/70 border border-white/10" title="Compose"><Send size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
