const fs = require('fs');
let code = fs.readFileSync('utils/smartIcons.tsx', 'utf8');

code = code.replace(
  /className={\`text-blue-400 \$\{className\}\`}/g,
  'className={`text-accent ${className}`}'
);

fs.writeFileSync('utils/smartIcons.tsx', code);
console.log('patched smartIcons.tsx');
