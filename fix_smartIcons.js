const fs = require('fs');
let code = fs.readFileSync('utils/smartIcons.tsx', 'utf8');

code = code.replace(
  /File, FileCode, FileJson, FileText, Globe, Image, Music, Video, Database, Settings, FileArchive, AppWindow \} from 'lucide-react';/,
  'Folder, File, FileCode, FileJson, FileText, Globe, Image, Music, Video, Database, Settings, FileArchive, AppWindow } from \'lucide-react\';'
);

code = code.replace(
  /if \(node\?\.customIcon\) \{/,
  `if (node?.type === 'directory') {
    return <Folder size={size} className={\`text-blue-400 \${className}\`} />;
  }
  if (node?.customIcon) {`
);

fs.writeFileSync('utils/smartIcons.tsx', code);
console.log('patched smartIcons.tsx');
