const fs = require('fs');
let code = fs.readFileSync('components/StartMenu.tsx', 'utf8');

code = code.replace(
  /bg-gradient-to-br from-emerald-400 to-blue-600/g,
  'bg-accent text-white'
);

fs.writeFileSync('components/StartMenu.tsx', code);
console.log('patched StartMenu.tsx');
