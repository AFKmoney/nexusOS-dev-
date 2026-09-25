import React, { useMemo, useState } from 'react';
import { useOS } from '../store/osStore';
import {
  Box,
  Check,
  Cpu,
  Download,
  Filter,
  Grid3X3,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  WandSparkles
} from 'lucide-react';

type StoreCategory = 'All' | 'Core' | 'AI' | 'Media' | 'Productivity' | 'Custom';

const CATEGORY_MAP: Record<StoreCategory, string[]> = {
  All: [],
  Core: ['system', 'utility'],
  AI: ['intelligence', 'dev'],
  Media: ['media'],
  Productivity: ['productivity'],
  Custom: ['custom']
};

function inferCategory(app: any): StoreCategory {
  const id = String(app?.id || '').toLowerCase();
  const name = String(app?.name || '').toLowerCase();
  const perms = Array.isArray(app?.permissions)
    ? app.permissions.map((p: string) => String(p).toLowerCase())
    : [];
  const haystack = `${id} ${name} ${perms.join(' ')}`;

  if (
    haystack.includes('appstore') ||
    haystack.includes('settings') ||
    haystack.includes('system') ||
    haystack.includes('monitor') ||
    haystack.includes('task')
  ) {
    return 'Core';
  }

  if (
    haystack.includes('hyperide') ||
    haystack.includes('forge') ||
    haystack.includes('daemon') ||
    haystack.includes('aion') ||
    haystack.includes('model') ||
    haystack.includes('terminal') ||
    haystack.includes('snippet')
  ) {
    return 'AI';
  }

  if (
    haystack.includes('paint') ||
    haystack.includes('music') ||
    haystack.includes('video') ||
    haystack.includes('wallpaper') ||
    haystack.includes('fractal') ||
    haystack.includes('rss')
  ) {
    return 'Media';
  }

  if (
    haystack.includes('note') ||
    haystack.includes('calendar') ||
    haystack.includes('kanban') ||
    haystack.includes('contacts') ||
    haystack.includes('file') ||
    haystack.includes('explorer') ||
    haystack.includes('calculator')
  ) {
    return 'Productivity';
  }

  return perms.includes('custom') || app?.isCustom ? 'Custom' : 'Core';
}

export default function AppStore() {
  const {
    registry,
    installedApps,
    installApp,
    addNotification,
    aiManagedStoreEnabled,
    setAiManagedStoreEnabled,
    openWindow,
    isMobileView
  } = useOS();

  const [search, setSearch] = useState('');
  const [category, setActiveCategory] = useState<StoreCategory>('All');
  const [isInstalling, setIsInstalling] = useState<string | null>(null);

  const appCards = useMemo(() => {
    return registry
      .filter((app) => {
        const haystack = `${app.name} ${app.description || ''} ${app.id}`.toLowerCase();
        if (search && !haystack.includes(search.toLowerCase())) return false;
        return category === 'All' ? true : inferCategory(app) === category;
      })
      .sort(
        (a, b) =>
          Number(installedApps.includes(a.id)) - Number(installedApps.includes(b.id))
      );
  }, [registry, installedApps, search, category]);

  const featuredApps = useMemo(() => {
    return appCards.slice(0, 6).filter((app) => !installedApps.includes(app.id));
  }, [appCards, installedApps]);

  const handleInstall = (appId: string) => {
    if (installedApps.includes(appId) || isInstalling === appId) return;

    setIsInstalling(appId);

    window.setTimeout(() => {
      installApp(appId);
      setIsInstalling(null);
      addNotification({
        title: 'Manifest Compiled',
        message: `${appId} integrated into local registry.`,
        type: 'success'
      });
    }, 900);
  };

  const handleAIInstall = () => {
    const candidate = featuredApps[0];
    if (!candidate) return;

    setAiManagedStoreEnabled(true);
    handleInstall(candidate.id);
    openWindow(candidate.id);
  };

  const categories = Object.keys(CATEGORY_MAP) as StoreCategory[];

  return (
    <div className="h-full flex flex-col bg-[#050508] text-white font-sans overflow-hidden relative select-none">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Responsive Header */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-black/40 backdrop-blur-3xl shrink-0 z-10">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-accent/20 rounded-2xl border border-accent/30 shadow-accent shrink-0">
              <Package size={20} className="text-accent" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-[0.2em] truncate">
                Registry Node
              </h1>
              <p className="text-zinc-500 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase truncate">
                Verified Manifest Distribution · AI Curated
              </p>
            </div>
          </div>

          {/* AI Store toggle visible on mobile row 1 */}
          <div className="md:hidden shrink-0">
            <button
              onClick={() => setAiManagedStoreEnabled(!aiManagedStoreEnabled)}
              className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all ${
                aiManagedStoreEnabled
                  ? 'bg-accent/15 border-accent/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-zinc-400'
              }`}
            >
              <WandSparkles size={12} className="inline mr-1" />
              AI Store {aiManagedStoreEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* AI Store toggle visible on desktop */}
          <button
            onClick={() => setAiManagedStoreEnabled(!aiManagedStoreEnabled)}
            className={`hidden md:flex items-center px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.18em] transition-all shrink-0 ${
              aiManagedStoreEnabled
                ? 'bg-accent/10 border-accent/30 text-emerald-300'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
            }`}
          >
            <WandSparkles size={14} className="mr-2" />
            AI Store {aiManagedStoreEnabled ? 'On' : 'Off'}
          </button>

          <div className="relative group flex-1 md:w-72">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
            <Search
              className="absolute left-3.5 top-2.5 text-zinc-500 group-focus-within:text-accent transition-colors"
              size={15}
            />
            <input
              className="w-full relative bg-black/60 border border-white/10 rounded-xl py-2 pl-10 pr-3 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-accent/50 transition-all placeholder:text-zinc-500 font-sans"
              placeholder="Query package index..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-zinc-500 hover:text-white shrink-0"
              title="Reset search"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Category Chips on Mobile */}
      {isMobileView && (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-black/20 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                category === cat
                  ? 'bg-accent/20 border border-accent/40 text-accent font-black shadow-sm'
                  : 'bg-white/5 border border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative z-0">
        {/* Desktop Category Sidebar */}
        {!isMobileView && (
          <div className="w-56 border-r border-white/5 bg-black/20 backdrop-blur-xl p-4 flex flex-col gap-1.5 shrink-0">
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2 px-3">
              Categories
            </div>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                  category === cat
                    ? 'bg-accent/15 border border-accent/30 text-accent shadow-accent'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >
                {cat}
                {category === cat && (
                  <Filter size={10} className="fill-current animate-pulse" />
                )}
              </button>
            ))}

            <div className="mt-4 p-4 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-2xl border border-white/5 relative overflow-hidden group">
              <ShieldCheck size={20} className="text-accent mb-2" />
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-0.5">
                Security Audit
              </div>
              <div className="text-[9px] text-zinc-500 font-mono leading-relaxed">
                Manifests are locally validated and sandboxed.
              </div>
            </div>

            <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                <Cpu size={12} />
                AI Auto-Picks
              </div>

              <div className="text-[9px] text-zinc-500 font-mono leading-relaxed mb-3 truncate">
                {featuredApps[0]?.name || 'All apps installed'}
              </div>

              <button
                onClick={handleAIInstall}
                disabled={!featuredApps[0] || isInstalling === featuredApps[0]?.id}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-accent/15 border border-accent/20 text-emerald-300 text-[9px] font-black uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/20 transition-all"
              >
                <Sparkles size={12} />
                Suggest & Install
              </button>
            </div>
          </div>
        )}

        {/* Apps Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-black/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                <Grid3X3 size={12} />
                {category === 'All' ? 'All manifests' : category}
              </div>

              <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-zinc-500">
                {appCards.length} package{appCards.length === 1 ? '' : 's'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {appCards.map((app) => {
                const isInstalled = installedApps.includes(app.id);
                const Icon = app.icon || Box;

                return (
                  <div
                    key={app.id}
                    className="group bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-[28px] p-4 sm:p-5 flex flex-col transition-all duration-300 hover:border-accent/30 hover:shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-2xl rounded-full pointer-events-none" />

                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center shadow-md group-hover:border-accent/40 transition-colors relative overflow-hidden shrink-0">
                        <Icon
                          size={24}
                          className="text-zinc-200 group-hover:text-accent transition-all duration-300"
                        />
                      </div>

                      <div className="flex gap-1">
                        <div className="px-2 py-0.5 bg-white/5 rounded-md text-[8px] font-bold uppercase tracking-widest text-zinc-500 border border-white/5">
                          v1.0
                        </div>
                        {app.isCustom && (
                          <div className="px-2 py-0.5 bg-accent/15 rounded-md text-[8px] font-black uppercase tracking-widest text-accent border border-accent/20">
                            FORGED
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide text-white mb-1 group-hover:text-accent transition-colors truncate">
                      {app.name}
                    </h3>

                    <p className="text-xs text-zinc-400 leading-relaxed font-normal mb-4 line-clamp-2 min-h-[32px]">
                      {app.description || 'Standard system application node.'}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Star size={11} className="text-accent fill-current" />
                        <span className="text-[10px] font-bold font-mono text-zinc-400">
                          4.9
                        </span>
                      </div>

                      <button
                        onClick={() => !isInstalled && handleInstall(app.id)}
                        disabled={isInstalled || isInstalling === app.id}
                        className={`flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all duration-200 active:scale-95 ${
                          isInstalled
                            ? 'bg-accent/15 text-accent border border-accent/25'
                            : isInstalling === app.id
                              ? 'bg-zinc-800 text-zinc-500'
                              : 'bg-accent text-white shadow-sm hover:brightness-110'
                        }`}
                      >
                        {isInstalling === app.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isInstalled ? (
                          <Check size={12} />
                        ) : (
                          <Download size={12} />
                        )}
                        {isInstalling === app.id ? 'VERIFYING' : isInstalled ? 'INSTALLED' : 'ACQUIRE'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {appCards.length === 0 && (
              <div className="text-center py-20">
                <div className="mx-auto w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3 border border-white/5">
                  <Search size={24} className="text-zinc-500" />
                </div>
                <div className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                  No matching package nodes
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="h-8 sm:h-9 bg-[#0a0a0c] border-t border-white/5 px-4 sm:px-8 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-500 uppercase tracking-widest truncate">
          <span className="flex items-center gap-1.5 truncate">
            <Cpu size={10} className="shrink-0" /> Cache: {Math.max(1.4, appCards.length * 0.18).toFixed(1)} GB
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Shield size={10} /> KERNEL_LEVEL
          </span>
        </div>

        <div className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.15em] text-accent/60 truncate">
          NEXUS REGISTRY // BROADCAST_01
        </div>
      </div>
    </div>
  );
}
