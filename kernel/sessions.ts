/**
 * SESSIONS MANAGER — Save/restore complete window arrangement
 */
import { uuid } from '../utils/uuid';

const LEGACY_SESSIONS_KEY = 'nexus_sessions_v1';
const SESSIONS_PREFIX = 'lazysiren_sessions_v1:';

function sessionsKey(userId: string) {
  return SESSIONS_PREFIX + (userId || 'guest');
}

export interface SavedWindow {
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  props?: Record<string, any>;
}

export interface Session {
  id: string;
  name: string;
  windows: SavedWindow[];
  savedAt: number;
}

class SessionsManager {
  private sessions: Session[] = [];
  private userId = 'guest';

  constructor() {
    this.load();
  }

  public switchUser(userId: string | null | undefined) {
    const next = userId || 'guest';
    if (next === this.userId) return;
    this.persist();
    this.userId = next;
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(sessionsKey(this.userId)) || (this.userId !== 'guest' ? localStorage.getItem(LEGACY_SESSIONS_KEY) : null);
      this.sessions = raw ? JSON.parse(raw) : [];
    } catch {
      this.sessions = [];
    }
  }

  private persist() {
    localStorage.setItem(sessionsKey(this.userId), JSON.stringify(this.sessions));
  }

  /** Save current window state as a session */
  save(name: string, windows: SavedWindow[]): Session {
    const session: Session = {
      id: uuid(),
      name,
      windows,
      savedAt: Date.now(),
    };
    this.sessions.push(session);
    if (this.sessions.length > 20) this.sessions.shift();
    this.persist();
    return session;
  }

  /** Auto-save the current session (called on logout/close) */
  autoSave(windows: SavedWindow[]) {
    // Overwrite the auto-save slot
    this.sessions = this.sessions.filter(s => s.name !== '__autosave__');
    this.save('__autosave__', windows);
  }

  /** Get the auto-saved session */
  getAutoSave(): Session | null {
    return this.sessions.find(s => s.name === '__autosave__') || null;
  }

  /** List all named sessions (excluding auto-save) */
  list(): Session[] {
    return this.sessions.filter(s => s.name !== '__autosave__').sort((a, b) => b.savedAt - a.savedAt);
  }

  /** Delete a session */
  delete(id: string) {
    this.sessions = this.sessions.filter(s => s.id !== id);
    this.persist();
  }

  /** Rename a session */
  rename(id: string, name: string) {
    const s = this.sessions.find(s => s.id === id);
    if (s) { s.name = name; this.persist(); }
  }
}

export const sessions = new SessionsManager();
