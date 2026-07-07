const fs = require('fs');
let code = fs.readFileSync('apps/hyperide/PreviewPane.tsx', 'utf8');

code = code.replace(/bg-white/g, 'bg-[#1E1E1E]');
code = code.replace(/bg-zinc-100/g, 'bg-[#252526]');
code = code.replace(/border-zinc-300/g, 'border-[#333]');
code = code.replace(/text-zinc-800/g, 'text-[#CCCCCC]');
code = code.replace(/text-zinc-400/g, 'text-[#858585]');
code = code.replace(/border-zinc-200/g, 'border-[#3C3C3C]');

fs.writeFileSync('apps/hyperide/PreviewPane.tsx', code);
console.log("Fixed PreviewPane.tsx colors.");
