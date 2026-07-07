const fs = require('fs');
let code = fs.readFileSync('components/ContextMenu.tsx', 'utf8');

code = code.replace(
  /const handleDelete = \(\) => \{/,
  `const handleEmptyTrash = () => {
    const items = vfs.listTrash();
    for (const item of items) {
      vfs.delete(item.path, SYSTEM_VFS_APP_ID);
    }
    addNotification({ title: 'Recycle Bin Emptied', message: \`\${items.length} item(s) removed\`, type: 'info' });
    closeContextMenu();
  };

  const handleDelete = () => {`
);

code = code.replace(
  /\{isImage && \(\n\s+<MenuItem icon=\{Wallpaper\} label="Set as Wallpaper" onClick=\{handleSetWallpaper\} \/>\n\s+\)\}/,
  `{isImage && (
                     <MenuItem icon={Wallpaper} label="Set as Wallpaper" onClick={handleSetWallpaper} />
                )}
                
                {fileName === 'Recycle Bin.lnk' && (
                     <MenuItem icon={Trash2} label="Empty Trash" onClick={handleEmptyTrash} danger />
                )}`
);

fs.writeFileSync('components/ContextMenu.tsx', code);
console.log('patched ContextMenu.tsx');
