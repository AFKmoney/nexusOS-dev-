
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOS } from '../store/osStore';
import {
  RefreshCw, AlertTriangle, ExternalLink, ArrowLeft, ArrowRight,
  Home, Globe, X, Search, Lock, Loader2, Shield, Brain,
  Activity, Copy, Check, ChevronDown, ChevronUp, Bot, FileText, Sparkles, Terminal
} from 'lucide-react';
import { aiPipelineBridge } from '../kernel/aiPipelineBridge';
import { aiService } from '../services/puterService';
import { eventBus } from '../kernel/eventBus';
import { SYSTEM_VFS_APP_ID,  vfs } from '../kernel/fileSystem';
import { browserBridge, type BrowserCommand, type BrowserExtractResult, type BrowserState } from '../kernel/browserBridge';

/**
 * WebRunner — NexusOS Embedded Web Browser
 *
 * Two rendering strategies:
 * 1. PROXY MODE (default): Fetches page HTML via CORS proxy, renders in srcdoc iframe.
 *    Works with most sites since we bypass X-Frame-Options entirely.
 * 2. NATIVE MODE (Electron only): When window.electron is available and the
 *    'browser-navigate' IPC channel is registered, WebRunner delegates
 *    rendering to a real Chromium BrowserView owned by the main process.
 *    This gives the AI true Chromium-level DOM access for BROWSE_EXTRACT,
 *    BROWSE_CLICK, and BROWSE_INPUT.
 *
 * In both modes, WebRunner registers itself with the browserBridge so that
 * AI-issued OS::BROWSE_* actions are routed here.
 */

const CORS_PROXIES = [
  '/api/proxy?url=',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

const HOMEPAGE_LINKS = [
  { icon: '📖', label: 'Wikipedia', url: 'https://en.wikipedia.org' },
  { icon: '🐙', label: 'GitHub', url: 'https://github.com' },
  { icon: '🤗', label: 'HuggingFace', url: 'https://huggingface.co' },
  { icon: '📦', label: 'NPM', url: 'https://www.npmjs.com' },
  { icon: '📚', label: 'MDN Docs', url: 'https://developer.mozilla.org' },
  { icon: '🦀', label: 'Rust Docs', url: 'https://docs.rs' },
  { icon: '⚛️', label: 'React Docs', url: 'https://react.dev' },
  { icon: '📰', label: 'Hacker News', url: 'https://news.ycombinator.com' },
];

export default function WebRunnerApp({ windowId, initialUrl: propUrl }: { windowId: string; initialUrl?: string }) {
  const { windows, updateWindow, addNotification } = useOS();
  const win = windows.find(w => w.id === windowId);

  const resolvedInitial = propUrl || win?.data?.url || win?.data?.path || '';

  const [currentUrl, setCurrentUrl] = useState('');
  const [urlInput, setUrlInput] = useState(resolvedInitial);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [pageHtml, setPageHtml] = useState('');
  const [backStack, setBackStack] = useState<string[]>([]);
  const [fwdStack, setFwdStack] = useState<string[]>([]);
  const [isSecure, setIsSecure] = useState(false);
  const [hasAutoNavigated, setHasAutoNavigated] = useState(false);

  // ─── AI Action & Activity Tracking ─────────────────────────────────
  const [activeAiAction, setActiveAiAction] = useState<{ text: string; kind: string; time: number } | null>(null);
  const [aiLogs, setAiLogs] = useState<Array<{ id: string; time: string; kind: string; detail: string; status: 'ok' | 'error' | 'working' }>>([]);
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiDrawerTab, setAiDrawerTab] = useState<'analysis' | 'logs'>('analysis');
  const [aiSummary, setAiSummary] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiCopied, setAiCopied] = useState(false);

  // Iframe ref — used for BROWSE_EXTRACT / BROWSE_CLICK / BROWSE_INPUT
  // in proxy mode. In native mode, the main-process BrowserView owns
  // the DOM and we delegate via IPC.
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Whether we have a real Chromium BrowserView in the main process.
  const isNativeMode = typeof window !== 'undefined'
    && !!(window as any).electron
    && typeof (window as any).electron.invoke === 'function';

  useEffect(() => {
    setIsSecure(currentUrl.startsWith('https://'));
  }, [currentUrl]);

  // ─── Browser bridge registration ───────────────────────────────────
  // Register this WebRunner instance as the active browser surface so
  // that AI-issued OS::BROWSE_* commands are routed here. Unregister on
  // unmount so a different browser window can become active.
  useEffect(() => {
    const surfaceId = `webrunner-${windowId}-${Date.now()}`;

    const executeCommand = async (cmd: BrowserCommand): Promise<unknown> => {
      const nowStr = new Date().toLocaleTimeString();
      let actionDesc = '';
      switch (cmd.kind) {
        case 'navigate': actionDesc = `Navigating to ${cmd.url}`; break;
        case 'click': actionDesc = `Clicking element "${cmd.selector}"`; break;
        case 'input': actionDesc = `Typing into "${cmd.selector}": "${cmd.value}"`; break;
        case 'extract': actionDesc = `Extracting page content from "${cmd.selector || 'body'}"`; break;
        case 'scroll': actionDesc = `Scrolling page (${cmd.deltaX}, ${cmd.deltaY})`; break;
        case 'back': actionDesc = 'Navigating Back'; break;
        case 'forward': actionDesc = 'Navigating Forward'; break;
        case 'reload': actionDesc = 'Reloading Page'; break;
        default: actionDesc = `Action: ${(cmd as any).kind}`;
      }
      const logId = 'log_' + Date.now() + Math.random().toString(36).slice(2, 6);
      setActiveAiAction({ text: actionDesc, kind: cmd.kind, time: Date.now() });
      setAiLogs(prev => [{ id: logId, time: nowStr, kind: cmd.kind.toUpperCase(), detail: actionDesc, status: 'working' }, ...prev.slice(0, 49)]);

      try {
        let result: unknown;
        switch (cmd.kind) {
          case 'navigate':
            navigate(cmd.url);
            result = undefined;
            break;
          case 'back':
            goBack();
            result = undefined;
            break;
          case 'forward':
            goForward();
            result = undefined;
            break;
          case 'reload':
            refresh();
            result = undefined;
            break;
          case 'scroll':
            result = executeInIframe((win) => {
              win.scrollBy(cmd.deltaX, cmd.deltaY);
              return true;
            });
            break;
          case 'click':
            result = executeInIframe((win) => {
              const el = win.document.querySelector(cmd.selector);
              if (el instanceof HTMLElement) { el.click(); return true; }
              return false;
            });
            break;
          case 'input':
            result = executeInIframe((win) => {
              const el = win.document.querySelector(cmd.selector);
              const EventCtor = (win as any).Event ?? Event;
              if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
                el.value = cmd.value;
                el.dispatchEvent(new EventCtor('input', { bubbles: true }));
                el.dispatchEvent(new EventCtor('change', { bubbles: true }));
                return true;
              }
              return false;
            });
            break;
          case 'extract':
            result = extractFromIframe(cmd.selector ?? 'body', cmd.maxChars ?? 8000);
            break;
          default:
            throw new Error(`Unknown browser command: ${(cmd as BrowserCommand).kind}`);
        }
        setAiLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'ok' } : l));
        return result;
      } catch (err: any) {
        setAiLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'error', detail: `${actionDesc} — Error: ${err?.message || 'Failed'}` } : l));
        throw err;
      } finally {
        setTimeout(() => {
          setActiveAiAction(curr => (curr && Date.now() - curr.time >= 6000 ? null : curr));
        }, 6000);
      }
    };

    const getState = (): BrowserState => ({
      url: currentUrl,
      title: hostname,
      isLoading,
      canGoBack: backStack.length > 0,
      canGoForward: fwdStack.length > 0,
      isNative: isNativeMode,
    });

    const unregister = browserBridge.register({
      id: surfaceId,
      execute: executeCommand,
      getState,
    });

    return () => {
      unregister();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowId, currentUrl, isLoading, backStack, fwdStack]);

  // Report state to the bridge whenever it changes so the AI sees fresh data.
  useEffect(() => {
    browserBridge.reportState({
      url: currentUrl,
      title: hostname,
      isLoading,
      canGoBack: backStack.length > 0,
      canGoForward: fwdStack.length > 0,
      isNative: isNativeMode,
    });
  }, [currentUrl, isLoading, backStack, fwdStack, isNativeMode]);

  // ─── Iframe DOM access helpers (proxy mode) ────────────────────────
  // These run a callback inside the iframe's contentWindow. Returns null
  // when the iframe is cross-origin (proxy mode usually gives us
  // same-origin via srcDoc, but some pages redirect to their real origin).
  const executeInIframe = <T,>(fn: (win: Window) => T): T | null => {
    const iframe = iframeRef.current;
    if (!iframe) return null;
    try {
      const win = iframe.contentWindow;
      if (!win) return null;
      return fn(win);
    } catch {
      // Cross-origin — can't access. This is expected for some proxied pages.
      return null;
    }
  };

  const extractFromIframe = (selector: string, maxChars: number): BrowserExtractResult => {
    const fallback: BrowserExtractResult = {
      url: currentUrl,
      title: hostname,
      text: '',
      html: '',
      links: [],
    };
    const result = executeInIframe((win) => {
      const doc = win.document;
      const root = doc.querySelector(selector) ?? doc.body;
      if (!root) return fallback;
      const text = (root.textContent || '').replace(/\s+/g, ' ').trim().slice(0, maxChars);
      const html = root.innerHTML.slice(0, maxChars * 4);
      const links: { text: string; href: string }[] = [];
      doc.querySelectorAll('a[href]').forEach((a, i) => {
        if (i >= 50) return;
        const href = (a as HTMLAnchorElement).href;
        if (!href || href.startsWith('javascript:')) return;
        links.push({ text: (a.textContent || '').trim().slice(0, 100), href });
      });
      return { url: currentUrl, title: doc.title || hostname, text, html, links };
    });
    return result ?? fallback;
  };

  // Auto-navigate on mount or when prop URL changes
  useEffect(() => {
    if (resolvedInitial && !hasAutoNavigated) {
      setHasAutoNavigated(true);
      navigate(resolvedInitial);
    }
  }, [resolvedInitial]);



  const normalizeUrl = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (/^(about|javascript|data):/i.test(trimmed)) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed)) return `https://${trimmed}`;
    return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
  };

  const fetchViaProxy = async (url: string): Promise<string> => {
    // Try each proxy until one works
    for (const proxy of CORS_PROXIES) {
      try {
        const resp = await fetch(proxy + encodeURIComponent(url), {
          signal: AbortSignal.timeout(12000),
        });
        if (!resp.ok) {
          console.warn(`[WebRunner] Proxy failed (status ${resp.status}): ${proxy}`);
          continue;
        }
        const html = await resp.text();
        if (html && html.length > 100) {
          console.info(`[WebRunner] Proxy success: ${proxy}`);
          return html;
        } else {
          console.warn(`[WebRunner] Proxy returned empty or too short content: ${proxy}`);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.warn(`[WebRunner] Proxy network error (${message}): ${proxy}`);
        continue;
      }
    }
    throw new Error('All proxies failed. Site may be unavailable.');
  };

  const injectBase = (html: string, baseUrl: string): string => {
    let origin = '';
    let basePath = '';
    try {
      const u = new URL(baseUrl);
      origin = u.origin;
      basePath = u.pathname.replace(/\/[^/]*$/, '/');
    } catch { /* ignore */ }

    const proxy = CORS_PROXIES[0]; // Use primary proxy for sub-resources

    // Resolve a relative URL to absolute
    const resolveUrl = (href: string): string => {
      if (!href || href.startsWith('data:') || href.startsWith('blob:') || href.startsWith('#') || href.startsWith('javascript:')) return href;
      try {
        return new URL(href, baseUrl).href;
      } catch {
        return href;
      }
    };

    // Proxy a URL for cross-origin resource loading
    const proxyUrl = (href: string): string => {
      const absolute = resolveUrl(href);
      if (absolute.startsWith('data:') || absolute.startsWith('blob:') || absolute.startsWith('#') || absolute.startsWith('javascript:')) {
        return absolute;
      }
      try {
        const u = new URL(absolute);
        const protocol = u.protocol.replace(':', '');
        const host = u.host;
        const pathAndQuery = u.pathname + u.search + u.hash;
        return `${window.location.origin}/api/proxy/${protocol}/${host}${pathAndQuery}`;
      } catch {
        return `${window.location.origin}/api/proxy?url=${encodeURIComponent(absolute)}`;
      }
    };

    // Rewrite link[href], img[src], script[src] to go through proxy
    let processed = html;

    // Rewrite <link rel="stylesheet" href="...">
    processed = processed.replace(
      /(<link[^>]*href=["'])([^"']+)(["'][^>]*>)/gi,
      (match, pre, href, post) => `${pre}${proxyUrl(href)}${post}`
    );

    // Rewrite <img src="..."> and <img srcset="...">
    processed = processed.replace(
      /(<img[^>]*src=["'])([^"']+)(["'])/gi,
      (match, pre, src, post) => `${pre}${proxyUrl(src)}${post}`
    );

    // Rewrite <script src="...">
    processed = processed.replace(
      /(<script[^>]*src=["'])([^"']+)(["'])/gi,
      (match, pre, src, post) => `${pre}${proxyUrl(src)}${post}`
    );

    // Rewrite url() in inline styles
    processed = processed.replace(
      /url\(["']?([^"')]+)["']?\)/gi,
      (match, href) => {
        if (href.startsWith('data:')) return match;
        return `url('${proxyUrl(href)}')`;
      }
    );

    // Insert <base> tag for any remaining relative URLs (anchors etc)
    const baseTag = `<base href="${origin}${basePath}">`;
    
    // Minimal iframe-safe overrides (just ensure images are responsive, don't nuke site styles)
    const styleOverride = `<style>img { max-width: 100%; height: auto; }</style>`;

    // Intercept clicks and form submissions inside the iframe to load them via proxy
    const iframeInterceptors = `<script>
      (function() {
        document.addEventListener('click', function(e) {
          var target = e.target;
          while (target && target.tagName !== 'A') {
            target = target.parentNode;
          }
          if (target && target.href) {
            var hrefAttr = target.getAttribute('href');
            if (hrefAttr && (hrefAttr.startsWith('#') || hrefAttr.startsWith('javascript:') || hrefAttr.startsWith('data:') || hrefAttr.startsWith('about:'))) return;
            if (target.href.startsWith('about:') || target.href.startsWith('javascript:') || target.href.startsWith('data:') || target.href.indexOf('about:srcdoc') !== -1) return;
            e.preventDefault();
            window.parent.postMessage({ type: 'webrunner-navigate', url: target.href }, '*');
          }
        }, true);

        document.addEventListener('submit', function(e) {
          var target = e.target;
          if (target && target.action) {
            var actionAttr = target.getAttribute('action');
            if (actionAttr && (actionAttr.startsWith('javascript:') || actionAttr.startsWith('data:') || actionAttr.startsWith('about:'))) return;
            if (target.action.startsWith('about:') || target.action.startsWith('javascript:') || target.action.startsWith('data:') || target.action.indexOf('about:srcdoc') !== -1) return;
            e.preventDefault();
            var method = (target.method || 'get').toLowerCase();
            var actionUrl = target.action;
            if (method === 'get') {
              var formData = new FormData(target);
              var params = new URLSearchParams();
              for (var pair of formData.entries()) {
                params.append(pair[0], pair[1]);
              }
              var separator = actionUrl.indexOf('?') !== -1 ? '&' : '?';
              actionUrl = actionUrl + separator + params.toString();
            }
            window.parent.postMessage({ type: 'webrunner-navigate', url: actionUrl }, '*');
          }
        }, true);
      })();
    </script>`;

    const headInjection = baseTag + styleOverride + iframeInterceptors;

    if (processed.includes('<head>')) {
      return processed.replace('<head>', `<head>${headInjection}`);
    } else if (processed.includes('<head ')) {
      return processed.replace(/<head\s/, `<head>${headInjection}</head><head `);
    } else if (processed.includes('<html')) {
      return processed.replace(/<html[^>]*>/, `$&<head>${headInjection}</head>`);
    }
    return `<html><head>${headInjection}</head><body>${processed}</body></html>`;
  };

  const loadPage = async (url: string) => {
    setIsLoading(true);
    setLoadError('');
    setPageHtml('');

    try {
      // Check if it is a special scheme
      if (/^(about|javascript|data):/i.test(url)) {
        if (url.toLowerCase().startsWith('about:blank')) {
          setPageHtml('<html><body></body></html>');
        } else {
          setPageHtml(`<html><body style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #cbd5e1;"><h3>Internal Frame Navigation</h3><p>Blocked browser navigation to: <code>${url}</code></p></body></html>`);
        }
        setIsLoading(false);
        return;
      }

      // Check if it's a local VFS path
      if (url.startsWith('/') || url.startsWith('/home/') || url.startsWith('/system/')) {
        const content = vfs.readFile(url, SYSTEM_VFS_APP_ID);
        if (content) {
          setPageHtml(content);
          setIsLoading(false);
          return;
        } else {
          throw new Error('Local file not found: ' + url);
        }
      }

      const rawHtml = await fetchViaProxy(url);
      const processedHtml = injectBase(rawHtml, url);
      setPageHtml(processedHtml);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load page';
      setLoadError(msg);
    }
    setIsLoading(false);
  };

  const navigate = (target: string) => {
    const finalUrl = normalizeUrl(target);
    if (!finalUrl) return;

    setLoadError('');

    if (currentUrl) {
      setBackStack(prev => [...prev.slice(-30), currentUrl]);
    }
    setFwdStack([]);
    setCurrentUrl(finalUrl);
    setUrlInput(finalUrl);

    // Update window data
    if (windowId) {
      updateWindow(windowId, { data: { ...win?.data, url: finalUrl } });
    }

    loadPage(finalUrl);
  };

  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  });

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'webrunner-navigate' && e.data.url) {
        navigateRef.current(e.data.url);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const goBack = () => {
    const prev = backStack[backStack.length - 1];
    if (!prev) return;
    setFwdStack(f => [currentUrl, ...f]);
    setBackStack(b => b.slice(0, -1));
    setCurrentUrl(prev);
    setUrlInput(prev);
    loadPage(prev);
  };

  const goForward = () => {
    const next = fwdStack[0];
    if (!next) return;
    setBackStack(b => [...b, currentUrl]);
    setFwdStack(f => f.slice(1));
    setCurrentUrl(next);
    setUrlInput(next);
    loadPage(next);
  };

  const refresh = () => {
    if (currentUrl) loadPage(currentUrl);
  };

  const goHome = () => {
    if (currentUrl) {
      setBackStack(prev => [...prev.slice(-30), currentUrl]);
    }
    setCurrentUrl('');
    setUrlInput('');
    setLoadError('');
    setPageHtml('');
    setFwdStack([]);
  };

  const openExternal = () => {
    if (currentUrl) window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') navigate(urlInput);
  };

  const analyzeWithAI = async () => {
    if (!pageHtml && !currentUrl) return;

    setShowAiDrawer(true);
    setAiDrawerTab('analysis');
    setIsAiThinking(true);
    setAiSummary('');

    // Strip HTML to get raw text for AI
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = pageHtml || '';
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const truncatedText = textContent.replace(/\s+/g, ' ').trim().slice(0, 10000);

    const nowStr = new Date().toLocaleTimeString();
    setActiveAiAction({ text: `Analyzing webpage ${hostname}...`, kind: 'analyze', time: Date.now() });
    setAiLogs(prev => [{ id: 'ai_ana_' + Date.now(), time: nowStr, kind: 'ANALYZE', detail: `Deep Page Analysis: ${hostname}`, status: 'working' }, ...prev.slice(0, 49)]);

    try {
      const prompt = `Analyze and provide a clear, comprehensive summary and key takeaways of the following webpage (${currentUrl}):\n\n${truncatedText}`;
      const rules = useOS.getState().kernelRules;

      let accumulated = '';
      await aiService.streamChat(prompt, rules, (token) => {
        accumulated += token;
        setAiSummary(accumulated);
      }, 'chat');

      if (!accumulated.trim()) {
        const fallback = await aiService.generateOnce(prompt, rules, 'chat');
        setAiSummary(fallback || 'Analysis complete. No content returned.');
      }
      setAiLogs(prev => prev.map(l => l.kind === 'ANALYZE' && l.status === 'working' ? { ...l, status: 'ok' } : l));
    } catch (e: any) {
      const errMsg = e?.message || 'Neural Link interrupted';
      setAiSummary(`Error during AI page analysis: ${errMsg}`);
      setAiLogs(prev => prev.map(l => l.kind === 'ANALYZE' && l.status === 'working' ? { ...l, status: 'error', detail: `Analysis failed: ${errMsg}` } : l));
    } finally {
      setIsAiThinking(false);
      setTimeout(() => {
        setActiveAiAction(curr => curr?.kind === 'analyze' ? null : curr);
      }, 5000);
    }
  };

  const copyAnalysis = () => {
    if (!aiSummary) return;
    navigator.clipboard.writeText(aiSummary);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2000);
  };

  const isHomepage = !currentUrl;
  const hostname = (() => {
    try { return new URL(currentUrl).hostname; } catch { return currentUrl; }
  })();

  return (
    <div className="h-full flex flex-col bg-[#0b0f17] text-slate-100 overflow-hidden relative">
      {/* Navigation Bar */}
      <div className="bg-[#0f172a] border-b border-slate-700/60 flex items-center gap-1.5 px-3 py-2 shrink-0 z-20">
        <button onClick={goBack} disabled={!backStack.length} className="p-1.5 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-20 text-slate-300 hover:text-white" title="Back">
          <ArrowLeft size={16} />
        </button>
        <button onClick={goForward} disabled={!fwdStack.length} className="p-1.5 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-20 text-slate-300 hover:text-white" title="Forward">
          <ArrowRight size={16} />
        </button>
        <button onClick={refresh} disabled={!currentUrl} className="p-1.5 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-20 text-slate-300 hover:text-white" title="Refresh">
          <RefreshCw size={16} className={isLoading ? 'animate-spin text-cyan-400' : ''} />
        </button>
        <button onClick={goHome} className="p-1.5 hover:bg-slate-800 rounded-lg transition-all text-slate-300 hover:text-white" title="Home">
          <Home size={16} />
        </button>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2 bg-slate-900 hover:bg-slate-800/90 border border-slate-700/70 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/40 rounded-xl px-3 py-1.5 transition-all">
          {currentUrl ? (
            isSecure ? <Lock size={13} className="text-emerald-400 shrink-0" /> : <Globe size={13} className="text-cyan-400 shrink-0" />
          ) : (
            <Search size={14} className="text-slate-400 shrink-0" />
          )}
          <input
            className="flex-1 bg-transparent text-sm outline-none text-slate-100 placeholder:text-slate-400 font-mono selection:bg-cyan-500/30"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={e => e.target.select()}
            placeholder="Search web or enter URL (e.g. wikipedia.org)..."
          />
          {urlInput && (
            <button onClick={() => setUrlInput('')} className="text-slate-400 hover:text-white shrink-0 p-0.5">
              <X size={14} />
            </button>
          )}
        </div>

        {/* AI Inspector Toggle */}
        <button
          onClick={() => setShowAiDrawer(!showAiDrawer)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            showAiDrawer || activeAiAction
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Toggle AI Activity & Inspector"
        >
          <Bot size={15} className={activeAiAction || isAiThinking ? 'text-cyan-400 animate-pulse' : 'text-slate-300'} />
          <span className="hidden sm:inline">AI Agent</span>
          {aiLogs.length > 0 && (
            <span className="px-1.5 py-0.2 bg-cyan-500/30 text-cyan-200 text-[10px] rounded-full font-mono font-bold">
              {aiLogs.length}
            </span>
          )}
        </button>

        {currentUrl && (
          <>
            <button
              onClick={analyzeWithAI}
              disabled={!pageHtml || isLoading || isAiThinking}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg transition-all text-emerald-300 hover:text-emerald-200 disabled:opacity-30 disabled:hover:bg-transparent text-xs font-semibold"
              title="Analyze Page with AI"
            >
              <Brain size={15} className={isAiThinking ? 'animate-spin text-emerald-400' : ''} />
              <span className="hidden md:inline">Analyze</span>
            </button>
            <button onClick={openExternal} className="p-1.5 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white" title="Open in system browser">
              <ExternalLink size={16} />
            </button>
          </>
        )}
      </div>

      {/* Live AI Action Banner (Always visible when AI is doing something in the browser) */}
      {activeAiAction && (
        <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border-b border-cyan-500/40 px-3 py-2 flex items-center justify-between z-20 text-xs shadow-md animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2 text-cyan-200 min-w-0">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-cyan-300 shrink-0">AI Action:</span>
            <span className="font-mono text-slate-100 font-medium truncate">{activeAiAction.text}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={() => { setShowAiDrawer(true); setAiDrawerTab('logs'); }}
              className="text-[11px] font-bold text-cyan-300 hover:text-white bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 px-2 py-0.5 rounded transition-all"
            >
              View Activity
            </button>
            <button
              onClick={() => setActiveAiAction(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* Browser viewport */}
        <div className="flex-1 relative overflow-hidden h-full">
          {isHomepage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#05070c] overflow-y-auto py-8">
              <div className="w-full max-w-xl px-5">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 mb-2.5">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                      <Globe size={32} className="text-cyan-400" />
                    </div>
                    <span className="text-2xl font-black tracking-wider text-white">WebRunner</span>
                  </div>
                  <p className="text-slate-200 text-sm font-medium">NexusOS High-Performance Embedded Web Browser</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 rounded-2xl px-4 py-3 mb-6 transition-all shadow-xl">
                  <Search size={20} className="text-slate-300 shrink-0" />
                  <input
                    autoFocus
                    className="flex-1 bg-transparent text-base outline-none text-white placeholder:text-slate-400 font-sans"
                    placeholder="Search the web or enter any URL..."
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={() => navigate(urlInput)}
                    disabled={!urlInput.trim()}
                    className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-30 shadow-md shadow-cyan-500/20"
                  >
                    Go
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {HOMEPAGE_LINKS.map(l => (
                    <button
                      key={l.url}
                      onClick={() => navigate(l.url)}
                      className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-400 hover:bg-slate-800 transition-all group shadow-md"
                    >
                      <span className="text-2xl">{l.icon}</span>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-all">{l.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-slate-900/90 border border-cyan-500/30 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-2 mb-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                    <Shield size={14} className="text-cyan-400" />
                    AUTONOMOUS AI BROWSER ENGINE
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed font-normal">
                    WebRunner bridges seamlessly with NexusOS AI agents. Click <strong className="text-white">Analyze</strong> to summarize pages, or watch the AI navigate and inspect web resources in real time through the live agent console.
                  </div>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 gap-4">
              <Loader2 size={40} className="text-cyan-400 animate-spin" />
              <div className="text-base text-slate-100 font-semibold">Loading {hostname}...</div>
              <div className="text-xs text-cyan-300 font-mono bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 max-w-md truncate">{currentUrl}</div>
            </div>
          ) : loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 p-4 sm:p-8">
              <AlertTriangle size={48} className="text-amber-400 mb-4 animate-bounce" />
              <h3 className="text-xl font-bold text-white mb-2">Cannot Display This Page</h3>
              <p className="text-slate-200 text-sm mb-3 text-center max-w-md bg-slate-900/80 p-3 rounded-xl border border-slate-800">{loadError}</p>
              <p className="text-cyan-300 text-xs mb-6 text-center max-w-md font-mono bg-slate-900 px-3 py-1 rounded-md">{hostname}</p>
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={openExternal}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <ExternalLink size={15} /> Open in System Browser
                </button>
                <button
                  onClick={refresh}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <RefreshCw size={15} /> Retry
                </button>
                <button
                  onClick={goHome}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Home
                </button>
              </div>
            </div>
          ) : pageHtml ? (
            <iframe
              ref={iframeRef}
              srcDoc={pageHtml}
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
              title={`WebRunner — ${hostname}`}
            />
          ) : null}
        </div>

        {/* AI Intelligence & Action Drawer */}
        {showAiDrawer && (
          <div className="w-full sm:w-80 md:w-96 bg-slate-950 border-l border-slate-800 flex flex-col h-full z-30 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
                  <Bot size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white">AI Agent Console</div>
                  <div className="text-[10px] text-cyan-300 font-mono">
                    {isAiThinking ? 'Processing...' : `${aiLogs.length} actions logged`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAiDrawer(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Close Drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/50 shrink-0">
              <button
                onClick={() => setAiDrawerTab('analysis')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  aiDrawerTab === 'analysis'
                    ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles size={13} />
                Page Analysis
              </button>
              <button
                onClick={() => setAiDrawerTab('logs')}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                  aiDrawerTab === 'logs'
                    ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity size={13} />
                Action Log ({aiLogs.length})
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {aiDrawerTab === 'analysis' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Synthesis</span>
                    <div className="flex items-center gap-2">
                      {aiSummary && (
                        <button
                          onClick={copyAnalysis}
                          className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 hover:text-white text-[11px] font-semibold transition-all"
                        >
                          {aiCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          {aiCopied ? 'Copied' : 'Copy'}
                        </button>
                      )}
                      <button
                        onClick={analyzeWithAI}
                        disabled={isAiThinking || !currentUrl}
                        className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-cyan-300 text-[11px] font-semibold transition-all disabled:opacity-40"
                      >
                        <RefreshCw size={12} className={isAiThinking ? 'animate-spin' : ''} />
                        Rerun
                      </button>
                    </div>
                  </div>

                  {isAiThinking && !aiSummary && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <Loader2 size={28} className="text-cyan-400 animate-spin" />
                      <div className="text-xs text-slate-200 font-medium animate-pulse">Extracting page semantics & generating summary...</div>
                    </div>
                  )}

                  {aiSummary ? (
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-100 text-xs leading-relaxed whitespace-pre-wrap font-sans selection:bg-cyan-500/30">
                      {aiSummary}
                    </div>
                  ) : !isAiThinking ? (
                    <div className="text-center py-12 px-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                      <Brain size={32} className="text-slate-500 mx-auto mb-3" />
                      <div className="text-xs text-slate-300 font-medium mb-2">No analysis for this page yet</div>
                      <p className="text-[11px] text-slate-400 mb-4">Click "Analyze Page" to let the AI summarize key takeaways and data.</p>
                      <button
                        onClick={analyzeWithAI}
                        disabled={!currentUrl}
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md disabled:opacity-40"
                      >
                        Analyze Current Page
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Executed Actions</span>
                    {aiLogs.length > 0 && (
                      <button
                        onClick={() => setAiLogs([])}
                        className="text-[10px] text-slate-400 hover:text-red-400 font-semibold transition-colors"
                      >
                        Clear Log
                      </button>
                    )}
                  </div>

                  {aiLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      <Activity size={28} className="text-slate-600 mx-auto mb-2" />
                      No browser actions recorded yet.
                    </div>
                  ) : (
                    aiLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs flex flex-col gap-1 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                            log.kind === 'NAVIGATE' ? 'bg-blue-500/20 text-blue-300' :
                            log.kind === 'CLICK' ? 'bg-amber-500/20 text-amber-300' :
                            log.kind === 'INPUT' ? 'bg-purple-500/20 text-purple-300' :
                            log.kind === 'EXTRACT' ? 'bg-emerald-500/20 text-emerald-300' :
                            'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {log.kind}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{log.time}</span>
                        </div>
                        <div className="text-slate-100 font-mono text-[11px] break-all leading-normal">
                          {log.detail}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {log.status === 'ok' && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                              <Check size={10} /> Success
                            </span>
                          )}
                          {log.status === 'working' && (
                            <span className="text-[10px] text-cyan-300 flex items-center gap-1 font-semibold animate-pulse">
                              <Loader2 size={10} className="animate-spin" /> In Progress
                            </span>
                          )}
                          {log.status === 'error' && (
                            <span className="text-[10px] text-red-400 flex items-center gap-1 font-semibold">
                              <AlertTriangle size={10} /> Failed
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-[#0f172a] border-t border-slate-800 px-3 py-1.5 flex items-center justify-between shrink-0 z-20 text-xs">
        <div className="flex items-center gap-2 text-slate-300 truncate font-mono">
          {currentUrl ? (
            <>
              {isSecure && <Lock size={12} className="text-emerald-400 shrink-0" />}
              <span className="truncate text-slate-200">{hostname}</span>
            </>
          ) : (
            <span className="text-slate-400">WebRunner Home</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {activeAiAction ? (
            <span className="text-cyan-300 font-semibold flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              AI Active: {activeAiAction.kind}
            </span>
          ) : (
            <span className="text-slate-400 font-medium">
              {loadError ? 'Error' : 'Ready'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
