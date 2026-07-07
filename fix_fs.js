const fs = require('fs');
let code = fs.readFileSync('kernel/fileSystem.ts', 'utf8');

code = code.replace(
  /'ReadMe.txt': \{/,
  `'Recycle Bin.lnk': {
                name: 'Recycle Bin.lnk',
                type: 'file',
                permissions: 'r-x',
                content: 'NEXUSOS_APP_SHORTCUT:recyclebin',
                created: Date.now(),
                modified: Date.now()
              },
              'ReadMe.txt': {`
);

fs.writeFileSync('kernel/fileSystem.ts', code);
console.log('patched fileSystem.ts');
