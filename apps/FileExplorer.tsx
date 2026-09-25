import React, { useState, useEffect } from 'react';
import { useOS } from '../store/osStore';
import { vfs } from '../kernel/fileSystem';
import { 
  Folder, ArrowLeft, RefreshCw, HardDrive, Search, Loader2, X, 
  Sparkles, LayoutGrid, List as ListIcon, Box, ChevronRight, Home, 
  Layout, Files, Info, Eye
} from 'lucide-react';
import { getSmartIcon } from '../utils/smartIcons';
import { aiService } from '../services/puterService';

export default function FileExplorerApp({ windowId }: { windowId: string }) {
  const { openWindow, updateWindow, windows, openContextMenu, kernelRules, isMobileView } = useOS();
  const win = windows.find(w => w.id === windowId);
  const currentPath = win?.data?.path || '/home/user';
  
  const [items, setItems] = useState<string[]>([]);
  const [metadataMap, setMetadataMap] = useState<{[key:string]: any}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const refresh = () => {
    if (searchQuery && !isAiSearching) return;
    
    // Safety check if directory was removed while open
    if (!vfs.stat(currentPath)) {
      navigate('/home/user');
      return;
    }
    
    const list = vfs.listDir(currentPath);
    setItems(list);
    
    const metas: any = {};
    list.forEach(name => {
        const fullPath = `${currentPath === '/' ? '' : currentPath}/${name}`;
        const node = vfs.stat(fullPath);
        if (node) {
            let info = { type: node.type, size: 0, date: new Date(node.modified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
            if (node.type === 'file') info.size = node.content?.length || 0;
            else { const stat = vfs.getStats(fullPath); info.size = stat?.size || 0; }
            metas[name] = { 
                summary: node.summary, 
                smartLabel: node.smartLabel,
                info
            };
        }
    });
    setMetadataMap(metas);
    if (!list.includes(selectedItem || '')) setSelectedItem(null);
  };

  useEffect(() => {
    if (!searchQuery) {
        refresh();
        const interval = setInterval(refresh, 2000);
        return () => clearInterval(interval);
    }
  }, [currentPath, searchQuery]);

  const handleSearch = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!searchQuery.trim()) { refresh(); return; }
      setIsAiSearching(true);
      const allFiles = vfs.listDir(currentPath);
      try {
          const fileContext = allFiles.map(f => {
              const stat = vfs.stat(`${currentPath}/${f}`);
              return { name: f, type: stat?.type };
          });
          const prompt = `Filter the file list based on query: "${searchQuery}". Context: ${JSON.stringify(fileContext)}. Return ONLY a JSON array of matched filenames.`;
          const res = await aiService.generateOnce(prompt, kernelRules, 'json');
          let matches = JSON.parse(res.replace(/```json|```/g, '').trim());
          if (Array.isArray(matches)) {
              const allFilesSet = new Set(allFiles);
              setItems(matches.filter(m => typeof m === 'string' && allFilesSet.has(m)));
          }
          else setItems(allFiles.filter(f => f.toLowerCase().includes(searchQuery.toLowerCase())));
      } catch (e) {
          setItems(allFiles.filter(f => f.toLowerCase().includes(searchQuery.toLowerCase())));
      } finally { setIsAiSearching(false); }
  };

  const clearSearch = () => { setSearchQuery(''); refresh(); };

  const navigate = (dir: string) => {
    let newPath = '';
    if (dir === '..') newPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    else if (dir.startsWith('/')) newPath = dir;
    else newPath = `${currentPath === '/' ? '' : currentPath}/${dir}`;
    updateWindow(windowId, { data: { ...win?.data, path: newPath } });
    setSearchQuery(''); setSelectedItem(null);
  };

  const handleOpen = (item: string) => {
    const fullPath = `${currentPath === '/' ? '' : currentPath}/${item}`;
    const node = vfs.stat(fullPath);
    if (node?.type === 'directory') navigate(item);
    else {
      if (item.endsWith('.png') || item.endsWith('.jpg')) openWindow('image_viewer', { path: fullPath });
      else if (item.endsWith('.mp4')) openWindow('video_player', { path: fullPath });
      else if (item.endsWith('.html')) openWindow('web_runner', { path: fullPath });
      else openWindow('notepad', { path: fullPath });
    }
  };

  const handleItemContextMenu = (e: React.MouseEvent, item: string) => {
    e.preventDefault(); e.stopPropagation();
    const fullPath = `${currentPath === '/' ? '' : currentPath}/${item}`;
    setSelectedItem(item);
    openContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: 'icon', filePath: fullPath });
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, item: string) => {
    const fullPath = `${currentPath === '/' ? '' : currentPath}/${item}`;
    e.dataTransfer.setData('text/plain', fullPath);
  };
  const handleDrop = (e: React.DragEvent, targetItem?: string) => {
    e.preventDefault();
    const oldPath = e.dataTransfer.getData('text/plain');
    if (!oldPath) return;
    const destPath = targetItem 
      ? (`${currentPath === '/' ? '' : currentPath}/${targetItem}`)
      : currentPath;
    
    const node = vfs.stat(destPath);
    if (node?.type === 'directory' && oldPath !== destPath && !destPath.startsWith(oldPath)) {
      vfs.move(oldPath, `${destPath}/${oldPath.split('/').pop()}`);
      refresh();
    }
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);
  const selectedNode = selectedItem ? vfs.stat(`${currentPath === '/' ? '' : currentPath}/${selectedItem}`) : null;

  const favoriteLocations = [
    { icon: Home, label: 'Home', path: '/home/user' },
    { icon: Layout, label: 'Desktop', path: '/home/user/Desktop' },
    { icon: Box, label: 'System', path: '/system' },
    { icon: Files, label: 'Root', path: '/' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#050508] text-zinc-200 font-sans select-none overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-white/5 bg-black/40 shrink-0">
        <div className="flex gap-1 shrink-0">
          <button 
            onClick={() => navigate('..')} 
            disabled={currentPath === '/' || !!searchQuery} 
            className="p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-30 text-zinc-400 hover:text-white transition"
            title="Go up one folder"
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            onClick={() => refresh()} 
            className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw size={16} className={isAiSearching ? 'animate-spin opacity-50' : ''} />
          </button>
        </div>
        
        {/* Breadcrumb */}
        <div className="flex-1 min-w-[140px] flex items-center gap-1 text-xs bg-zinc-900/60 px-2.5 py-1.5 rounded-lg border border-white/5 text-zinc-400 overflow-x-auto no-scrollbar">
          <button onClick={() => navigate('/')} className="hover:text-white transition shrink-0" title="Root"><HardDrive size={13} /></button>
          {breadcrumbs.map((crumb: string, i: number) => {
            const path = '/' + breadcrumbs.slice(0, i + 1).join('/');
            return (
              <React.Fragment key={path}>
                <ChevronRight size={11} className="shrink-0 opacity-40 mx-0.5" />
                <button onClick={() => navigate(path)} className="hover:text-white truncate max-w-[90px] transition text-zinc-300 font-mono">{crumb}</button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="w-full sm:w-56 relative group shrink-0 order-last sm:order-none">
          <div className="absolute left-2.5 top-2 flex items-center pointer-events-none">
              {isAiSearching ? <Loader2 size={13} className="text-accent animate-spin" /> : <Sparkles size={13} className={`transition-colors ${searchQuery ? 'text-accent' : 'text-zinc-600'}`} />}
          </div>
          <input 
            className="w-full bg-zinc-900 border border-white/5 rounded-lg pl-8 pr-7 py-1 text-xs outline-none focus:border-accent/50 transition-all text-white placeholder:text-zinc-600" 
            placeholder="Neural Query..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
          {searchQuery && <button type="button" onClick={clearSearch} className="absolute right-2 top-1.5 text-zinc-500 hover:text-white"><X size={13} /></button>}
        </form>

        {/* View toggles & info */}
        <div className="flex items-center gap-1 shrink-0">
          {selectedItem && isMobileView && (
            <button 
              onClick={() => setShowMobilePreview(!showMobilePreview)} 
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${showMobilePreview ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/10 text-zinc-400'}`}
              title="Inspect file"
            >
              <Eye size={14} />
            </button>
          )}
          <div className="flex items-center gap-0.5 bg-zinc-900/60 rounded-lg border border-white/5 p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><LayoutGrid size={14} /></button>
            <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><ListIcon size={14} /></button>
          </div>
        </div>
      </div>

      {/* Mobile Favorites Bar (horizontal pills) */}
      {isMobileView ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/30 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mr-1 shrink-0">Nav:</span>
          {favoriteLocations.map(f => (
            <button 
              key={f.path} 
              onClick={() => navigate(f.path)} 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition shrink-0 ${
                currentPath === f.path 
                  ? 'bg-accent/20 border border-accent/40 text-accent' 
                  : 'bg-white/5 border border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <f.icon size={11} /> {f.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        {!isMobileView && (
          <div className="w-44 bg-black/20 border-r border-white/5 flex flex-col p-2 space-y-1 shrink-0">
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-1 mt-2">Favorites</div>
            {favoriteLocations.map(f => (
              <button 
                key={f.path} 
                onClick={() => navigate(f.path)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition ${currentPath === f.path ? 'bg-accent/15 text-accent font-semibold' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              >
                <f.icon size={14} /> {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0C]" 
          onDragOver={e => e.preventDefault()} 
          onDrop={e => handleDrop(e)} 
          onClick={() => setSelectedItem(null)}>
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
            {searchQuery && !isAiSearching && (
                <div className="mb-3 text-xs font-bold text-accent/80 uppercase tracking-widest flex items-center gap-2">
                    <Search size={14} /> Found {items.length} results
                </div>
            )}

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2 sm:gap-3">
                {items.map(item => {
                  if (typeof item !== 'string') return null;
                  const fullPath = `${currentPath === '/' ? '' : currentPath}/${item}`;
                  const isDir = metadataMap[item]?.info?.type === 'directory';
                  const isSelected = selectedItem === item;
                  return (
                    <div key={item}
                      draggable
                      onDragStart={e => handleDragStart(e, item)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.stopPropagation(); handleDrop(e, item); }}
                      onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                      onDoubleClick={() => handleOpen(item)}
                      onContextMenu={(e) => handleItemContextMenu(e, item)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition cursor-pointer select-none border min-w-0 ${isSelected ? 'bg-accent/15 border-accent/40 shadow-sm shadow-accent/10 ring-1 ring-accent/30' : 'border-transparent hover:bg-white/5'}`}>
                      <div className="relative shrink-0 p-1">
                        {isDir ? <Folder size={42} className="text-accent" /> : getSmartIcon(fullPath, 42)}
                      </div>
                      <span 
                        title={item}
                        className={`text-xs text-center w-full px-1 truncate select-none ${isSelected ? 'text-white font-medium' : 'text-zinc-300'}`}
                      >
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-1 gap-4">
                  <div className="flex-1 min-w-0">Name</div>
                  <div className="w-28 sm:w-36 text-right shrink-0">Date Modified</div>
                  <div className="w-16 sm:w-20 text-right shrink-0">Size</div>
                </div>
                {items.map(item => {
                  if (typeof item !== 'string') return null;
                  const fullPath = `${currentPath === '/' ? '' : currentPath}/${item}`;
                  const meta = metadataMap[item]?.info;
                  const isDir = meta?.type === 'directory';
                  const isSelected = selectedItem === item;
                  return (
                    <div key={item}
                      draggable
                      onDragStart={e => handleDragStart(e, item)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.stopPropagation(); handleDrop(e, item); }}
                      onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                      onDoubleClick={() => handleOpen(item)}
                      onContextMenu={(e) => handleItemContextMenu(e, item)}
                      className={`flex items-center px-3 py-2 rounded-lg transition cursor-pointer select-none gap-4 ${isSelected ? 'bg-accent/15 text-white font-medium' : 'hover:bg-white/5 text-zinc-300'}`}>
                      <div className="flex-1 min-w-0 flex items-center gap-2.5">
                        <span className="shrink-0">{isDir ? <Folder size={17} className="text-accent" /> : getSmartIcon(fullPath, 17)}</span>
                        <span className="text-xs truncate">{item}</span>
                      </div>
                      <div className="w-28 sm:w-36 text-right text-[10px] text-zinc-400 truncate shrink-0">{meta?.date}</div>
                      <div className="w-16 sm:w-20 text-right text-[10px] text-zinc-400 font-mono shrink-0">{meta?.size} B</div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {items.length === 0 && !isAiSearching && (
              <div className="flex flex-col items-center justify-center text-zinc-600 py-16 gap-3">
                  <Folder size={36} className="opacity-25" />
                  <span className="text-xs">Folder is empty</span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Preview Panel */}
        {!isMobileView && selectedItem && selectedNode && (
          <div className="w-60 bg-zinc-900/90 border-l border-white/5 p-4 flex flex-col shrink-0 overflow-y-auto">
            <div className="flex justify-center mb-3 p-3 bg-black/40 rounded-xl border border-white/5">
              {selectedNode.type === 'directory' ? <Folder size={48} className="text-accent" /> : getSmartIcon(selectedNode.name, 48)}
            </div>
            <div className="text-xs font-bold text-white mb-3 break-all">{selectedNode.name}</div>
            
            <div className="space-y-2.5">
              <div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">Type</div>
                <div className="text-xs text-zinc-300 capitalize">{selectedNode.type}</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">Size</div>
                <div className="text-xs text-zinc-300 font-mono">{metadataMap[selectedItem]?.info?.size} Bytes</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">Modified</div>
                <div className="text-xs text-zinc-300">{new Date(selectedNode.modified).toLocaleString('en-US')}</div>
              </div>
            </div>

            {selectedNode.type === 'file' && selectedNode.content && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">Preview</div>
                <div className="bg-black/40 p-2 rounded text-[10px] text-zinc-400 font-mono overflow-hidden line-clamp-6 text-ellipsis whitespace-pre-wrap border border-white/5">
                  {selectedNode.content}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Preview Bottom Sheet */}
        {isMobileView && showMobilePreview && selectedItem && selectedNode && (
          <div className="absolute inset-x-0 bottom-0 bg-zinc-900 border-t border-white/10 p-4 shadow-2xl z-20 flex flex-col max-h-[60%] overflow-y-auto rounded-t-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2">
                {selectedNode.type === 'directory' ? <Folder size={18} className="text-accent" /> : getSmartIcon(selectedNode.name, 18)}
                <span className="text-xs font-bold text-white truncate max-w-[200px]">{selectedNode.name}</span>
              </div>
              <button onClick={() => setShowMobilePreview(false)} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="p-2 bg-black/40 rounded-lg">
                <span className="text-[9px] text-zinc-500 uppercase block">Type</span>
                <span className="text-zinc-200 capitalize font-medium">{selectedNode.type}</span>
              </div>
              <div className="p-2 bg-black/40 rounded-lg">
                <span className="text-[9px] text-zinc-500 uppercase block">Size</span>
                <span className="text-zinc-200 font-mono font-medium">{metadataMap[selectedItem]?.info?.size} B</span>
              </div>
            </div>
            {selectedNode.type === 'file' && (
              <button 
                onClick={() => { setShowMobilePreview(false); handleOpen(selectedItem); }}
                className="w-full py-2 bg-accent/20 border border-accent/40 rounded-xl text-accent font-bold text-xs hover:bg-accent/30 transition mb-1"
              >
                Open File
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
