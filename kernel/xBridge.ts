import { eventBus, OS_EVENTS } from './eventBus';
import { vfs, SYSTEM_VFS_APP_ID } from './fileSystem';
import { useOS } from '../store/osStore';
import { kernelLog } from './log';

const CREDS_PATH = '/home/user/.x-credentials.json';

export interface XCredentials {
  bearerToken?: string;
  userAccessToken?: string;
  handle?: string;
}

export interface XPost {
  id: string;
  text: string;
  author?: string;
  url: string;
}

export function loadXCredentials(): XCredentials {
  try {
    const raw = vfs.readFile(CREDS_PATH, SYSTEM_VFS_APP_ID);
    if (!raw) return {};
    return JSON.parse(raw) as XCredentials;
  } catch {
    return {};
  }
}

export function saveXCredentials(next: XCredentials): void {
  vfs.writeFile(`${CREDS_PATH}`, JSON.stringify(next, null, 2), SYSTEM_VFS_APP_ID);
  eventBus.emit(OS_EVENTS.X_STATUS, { connected: Boolean(next.bearerToken || next.userAccessToken), handle: next.handle });
}

async function xFetch(method: 'GET' | 'POST', url: string, token: string, body?: unknown): Promise<any> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const electron = typeof window !== 'undefined' ? (window as any).electron : null;
  if (electron?.invoke) {
    return electron.invoke('ai-proxy', { url, method, headers, body });
  }
  if (method === 'POST') {
    const res = await fetch('/api/ai/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, headers, body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || data?.detail || `X proxy ${res.status}`);
    return data;
  }
  const res = await fetch(url, { method, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || data?.title || `X API ${res.status}`);
  return data;
}

export function openXSurface(path?: string): void {
  useOS.getState().openWindow('x', path ? { path } : undefined);
  eventBus.emit(OS_EVENTS.X_COMMAND, { action: 'open', path });
}

export function xComposeUrl(text: string): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function xSearchUrl(query: string): string {
  return `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query`;
}

export function xProfileUrl(handle: string): string {
  const h = handle.replace(/^@/, '');
  return `https://x.com/${h}`;
}

export async function xSearch(query: string): Promise<{ posts: XPost[]; fallback?: string }> {
  const creds = loadXCredentials();
  const token = creds.bearerToken || creds.userAccessToken;
  if (!token) {
    const url = xSearchUrl(query);
    openXSurface(url);
    return { posts: [], fallback: url };
  }
  try {
    const url = `https://api.x.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=created_at,author_id`;
    const data = await xFetch('GET', url, token);
    const posts: XPost[] = (data?.data || []).map((t: any) => ({
      id: String(t.id),
      text: String(t.text || ''),
      author: t.author_id ? String(t.author_id) : undefined,
      url: `https://x.com/i/web/status/${t.id}`,
    }));
    eventBus.emit(OS_EVENTS.X_RESULTS, { kind: 'search', query, posts });
    return { posts };
  } catch (e) {
    kernelLog.warn('[X] search API failed, opening web search', e);
    const url = xSearchUrl(query);
    openXSurface(url);
    return { posts: [], fallback: url };
  }
}

export async function xPost(text: string): Promise<{ ok: boolean; id?: string; fallback?: string; error?: string }> {
  const creds = loadXCredentials();
  const token = creds.userAccessToken || creds.bearerToken;
  const clipped = text.slice(0, 280);
  if (!token) {
    const url = xComposeUrl(clipped);
    openXSurface(url);
    return { ok: false, fallback: url, error: 'No X token. Compose window opened.' };
  }
  try {
    const data = await xFetch('POST', 'https://api.x.com/2/tweets', token, { text: clipped });
    const id = data?.data?.id ? String(data.data.id) : undefined;
    eventBus.emit(OS_EVENTS.X_RESULTS, { kind: 'post', id, text: clipped });
    return { ok: true, id };
  } catch (e) {
    const url = xComposeUrl(clipped);
    openXSurface(url);
    return { ok: false, fallback: url, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function xTimeline(): Promise<{ posts: XPost[]; fallback?: string }> {
  const creds = loadXCredentials();
  const handle = creds.handle || 'home';
  const home = handle === 'home' ? 'https://x.com/home' : xProfileUrl(handle);
  openXSurface(home);
  return { posts: [], fallback: home };
}

export function dispatchXCommand(args: { action?: string; text?: string; query?: string; handle?: string }): string {
  const action = String(args.action || '').trim();
  if (action === 'open') {
    openXSurface();
    return '[X] opened';
  }
  if (action === 'profile') {
    const url = xProfileUrl(String(args.handle || loadXCredentials().handle || 'x'));
    openXSurface(url);
    return `[X] profile ${url}`;
  }
  if (action === 'search') {
    return `[X] search queued: ${args.query || ''}`;
  }
  if (action === 'post') {
    return `[X] post queued: ${(args.text || '').slice(0, 80)}`;
  }
  if (action === 'timeline') {
    return '[X] timeline opened';
  }
  return '[X] unknown action';
}
