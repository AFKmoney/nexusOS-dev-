const fs = require('fs');
let code = fs.readFileSync('apps/HyperIDE.tsx', 'utf8');

code = code.replace(
  /const \[showNewFile, setShowNewFile\] = useState\(false\);/,
  'const [showNewFile, setShowNewFile] = useState(false);\n  const [isNewFolder, setIsNewFolder] = useState(false);'
);

code = code.replace(
  /const createFile = \(dir\?: string\) => \{([^}]*)\};/s,
  (match, inner) => {
    return `const createFile = (dir?: string) => {
    const targetDir = dir || newFileDir || project?.rootPath || currentDir;
    if (!newFileName.trim()) return;
    const p = \`\${targetDir}/\${newFileName}\`;
    if (isNewFolder) {
      vfs.createDir(p, SYSTEM_VFS_APP_ID);
    } else {
      vfs.writeFile(p, '', SYSTEM_VFS_APP_ID);
      openFile(p);
    }
    setNewFileName('');
    setShowNewFile(false);
    setIsNewFolder(false);
    setNewFileDir('');
  };`;
  }
);

code = code.replace(
  /onNewFileClick=\{\(\) => \{ setNewFileDir\(''\); setShowNewFile\(true\); \}\}/,
  `onNewFileClick={() => { setIsNewFolder(false); setNewFileDir(''); setShowNewFile(true); }}\n            onNewFolderClick={() => { setIsNewFolder(true); setNewFileDir(''); setShowNewFile(true); }}\n            isNewFolder={isNewFolder}`
);

code = code.replace(
  /onNewFileHere=\{\(path\) => \{ setNewFileDir\(path\); setShowNewFile\(true\); setContextMenu\(null\); \}\}/,
  `onNewFileHere={(path) => { setIsNewFolder(false); setNewFileDir(path); setShowNewFile(true); setContextMenu(null); }}`
);

fs.writeFileSync('apps/HyperIDE.tsx', code);
console.log('patched HyperIDE.tsx');
