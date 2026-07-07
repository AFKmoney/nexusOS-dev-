const fs = require('fs');
let code = fs.readFileSync('apps/hyperide/SidePanel.tsx', 'utf8');

code = code.replace(
  /            <\/>\n          \)\}\}/,
  '            </>\n          )}'
);

fs.writeFileSync('apps/hyperide/SidePanel.tsx', code);
console.log('fixed SidePanel.tsx');
