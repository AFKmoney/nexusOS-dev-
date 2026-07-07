const fs = require('fs');
let code = fs.readFileSync('apps/HyperIDE.tsx', 'utf8');

code = code.replace(
  /onNewFileHere=\{\(path\) => \{ setIsNewFolder\(false\); setNewFileDir\(path\); setShowNewFile\(true\); setContextMenu\(null\); \}\}/,
  `onNewFileHere={(path) => { setIsNewFolder(false); setNewFileDir(path); setShowNewFile(true); setContextMenu(null); }}
          onNewFolderHere={(path) => { setIsNewFolder(true); setNewFileDir(path); setShowNewFile(true); setContextMenu(null); }}`
);

fs.writeFileSync('apps/HyperIDE.tsx', code);
console.log('patched HyperIDE context menu');
