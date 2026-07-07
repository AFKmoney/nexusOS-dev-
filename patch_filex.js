const fs = require('fs');
let code = fs.readFileSync('apps/FileExplorer.tsx', 'utf8');

code = code.replace(/text-blue-500/g, 'text-accent');
code = code.replace(/text-cyan-400/g, 'text-accent');
code = code.replace(/text-cyan-500/g, 'text-accent');
code = code.replace(/bg-cyan-500\/10/g, 'bg-accent/10');
code = code.replace(/border-cyan-500\/30/g, 'border-accent/30');
code = code.replace(/bg-cyan-500\/20/g, 'bg-accent/20');
code = code.replace(/shadow-\[0_0_15px_rgba\(34,211,238,0\.1\)\]/g, 'shadow-accent/10');
code = code.replace(/focus:border-cyan-400\/50/g, 'focus:border-accent/50');
code = code.replace(/text-cyan-400\/50/g, 'text-accent/50');
code = code.replace(/text-cyan-400\/80/g, 'text-accent/80');

fs.writeFileSync('apps/FileExplorer.tsx', code);
console.log('patched FileExplorer.tsx');
