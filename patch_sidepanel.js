const fs = require('fs');
let code = fs.readFileSync('apps/hyperide/SidePanel.tsx', 'utf8');

code = code.replace(
  /FilePlus, Layout, Search, GitBranch, Sparkles, File, ShieldAlert, AlignLeft/g,
  'FilePlus, FolderPlus, Layout, Search, GitBranch, Sparkles, File, ShieldAlert, AlignLeft'
);

code = code.replace(
  /showNewFile: boolean;/,
  'showNewFile: boolean;\n  isNewFolder?: boolean;'
);

code = code.replace(
  /onNewFileClick: \(\) => void;/,
  'onNewFileClick: () => void;\n  onNewFolderClick?: () => void;'
);

code = code.replace(
  /const \{([^}]*)onNewFileClick, onSetNewFileName, onCreateFile/s,
  'const {$1onNewFileClick, onNewFolderClick, onSetNewFileName, onCreateFile'
);

code = code.replace(
  /\{sidePanel === 'files' && \(\s*<button\s*onClick=\{onNewFileClick\}\s*className="text-\[#CCCCCC\] hover:text-white p-1 rounded hover:bg-white\/10 transition-all"\s*title="New File"\s*>\s*<FilePlus size=\{14\} \/>\s*<\/button>\s*\)/s,
  `{sidePanel === 'files' && (
            <>
              <button
                onClick={onNewFileClick}
                className="text-[#CCCCCC] hover:text-white p-1 rounded hover:bg-white/10 transition-all"
                title="New File"
              >
                <FilePlus size={14} />
              </button>
              {onNewFolderClick && (
                <button
                  onClick={onNewFolderClick}
                  className="text-[#CCCCCC] hover:text-white p-1 rounded hover:bg-white/10 transition-all"
                  title="New Folder"
                >
                  <FolderPlus size={14} />
                </button>
              )}
            </>
          )}`
);

code = code.replace(
  /<FilePlus size=\{14\} className="text-\[#007ACC\] shrink-0" \/>/,
  `{isNewFolder ? <FolderPlus size={14} className="text-[#007ACC] shrink-0" /> : <FilePlus size={14} className="text-[#007ACC] shrink-0" />}`
);

fs.writeFileSync('apps/hyperide/SidePanel.tsx', code);
console.log('patched SidePanel.tsx');
