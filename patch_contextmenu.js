const fs = require('fs');
let code = fs.readFileSync('apps/hyperide/FileContextMenu.tsx', 'utf8');

code = code.replace(
  /FilePlus, FolderOpen, File, AlignLeft, Copy, X,/,
  'FilePlus, FolderPlus, FolderOpen, File, AlignLeft, Copy, X,'
);

code = code.replace(
  /onNewFileHere: \(path: string\) => void;/,
  'onNewFileHere: (path: string) => void;\n  onNewFolderHere: (path: string) => void;'
);

code = code.replace(
  /onNewFileHere,/,
  'onNewFileHere,\n  onNewFolderHere,'
);

code = code.replace(
  /<FilePlus size=\{16\} \/> New File Here\s*<\/button>/,
  `<FilePlus size={16} /> New File Here
          </button>
          <button
            onClick={() => { onNewFolderHere(state.path); }}
            className="w-full text-left px-4 py-2.5 text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors flex items-center gap-3 font-medium"
          >
            <FolderPlus size={16} /> New Folder Here
          </button>`
);

fs.writeFileSync('apps/hyperide/FileContextMenu.tsx', code);
console.log('patched FileContextMenu.tsx');
