const fs = require('fs');
let code = fs.readFileSync('utils/smartIcons.tsx', 'utf8');

code = code.replace(
  /Folder, File, FileCode, FileJson, FileText, Globe, Image, Music, Video, Database, Settings, FileArchive, AppWindow \} from 'lucide-react';/,
  'Trash2, Folder, File, FileCode, FileJson, FileText, Globe, Image, Music, Video, Database, Settings, FileArchive, AppWindow } from \'lucide-react\';'
);

code = code.replace(
  /const fileName = parts\[parts\.length - 1\] \?\? '';/,
  `const fileName = parts[parts.length - 1] ?? '';
  if (fileName === 'Trash.lnk' || fileName === 'Recycle Bin.lnk') return <Trash2 size={size} className={\`text-red-400 \${className}\`} />;`
);

fs.writeFileSync('utils/smartIcons.tsx', code);
console.log('patched smartIcons.tsx');
