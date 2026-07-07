const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('App.tsx', 'utf8');
appCode = appCode.replace(
  /if \(\!vfs\.resolveNode\(homeDir\)\) vfs\.createDir\(homeDir, '__system__'\);/g,
  `if (!vfs.resolveNode(homeDir)) vfs.createDir(homeDir, '__system__');
    
    if (!vfs.resolveNode(\`\${homeDir}/Trash.lnk\`) && !vfs.resolveNode(\`\${homeDir}/Recycle Bin.lnk\`)) {
        vfs.writeFile(\`\${homeDir}/Trash.lnk\`, 'NEXUSOS_APP_SHORTCUT:recyclebin', '__system__');
    }`
);
fs.writeFileSync('App.tsx', appCode);

// Patch ContextMenu.tsx
let cmCode = fs.readFileSync('components/ContextMenu.tsx', 'utf8');
cmCode = cmCode.replace(
  /\{fileName === 'Recycle Bin\.lnk' && \(/g,
  `{(fileName === 'Recycle Bin.lnk' || fileName === 'Trash.lnk') && (`
);

// Also add Empty Trash to desktop context menu if right clicked on desktop
cmCode = cmCode.replace(
  /<SubHeader label="Add App to Desktop" \/>/g,
  `<MenuItem icon={Trash2} label="Empty Trash" onClick={handleEmptyTrash} danger />
                <Separator />
                <SubHeader label="Add App to Desktop" />`
);

fs.writeFileSync('components/ContextMenu.tsx', cmCode);
console.log('patched App.tsx and ContextMenu.tsx');
