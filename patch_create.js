const fs = require('fs');
let code = fs.readFileSync('components/ContextMenu.tsx', 'utf8');

code = code.replace(
  /const handleCreateFile = \(type: 'folder' \| 'txt'\) => \{[\s\S]*?closeContextMenu\(\);\n  \};/,
  `const handleCreateFile = (type: 'folder' | 'txt') => {
      const dir = contextMenu.filePath || \`/home/\${currentUser?.id || 'admin'}/Desktop\`;
      let name = type === 'folder' ? 'New Folder' : 'New File';
      let ext = type === 'folder' ? '' : '.txt';
      let counter = 1;
      let finalPath = \`\${dir}/\${name}\${ext}\`;
      
      while (vfs.stat(finalPath)) {
          finalPath = \`\${dir}/\${name} \${counter}\${ext}\`;
          counter++;
      }

      if (type === 'folder') vfs.createDir(finalPath, SYSTEM_VFS_APP_ID);
      else vfs.writeFile(finalPath, '', SYSTEM_VFS_APP_ID);
      closeContextMenu();
  };`
);

fs.writeFileSync('components/ContextMenu.tsx', code);
console.log('patched ContextMenu.tsx');
