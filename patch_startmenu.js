const fs = require('fs');
let code = fs.readFileSync('components/StartMenu.tsx', 'utf8');

const accents = `
  const ACCENTS = [
    { name: 'Emerald', color: '#10b981' },
    { name: 'Amber', color: '#f59e0b' },
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Rose', color: '#f43f5e' },
    { name: 'Violet', color: '#8b5cf6' },
    { name: 'Zinc', color: '#71717a' },
  ];
`;

code = code.replace(
  /const handleAccentChange = \(preset: string, color: string\) => \{[\s\S]*?\};/,
  `${accents}
  const handleAccentCycle = () => {
    const currentIndex = ACCENTS.findIndex(a => a.color === useOS.getState().accentColor);
    const nextIndex = (currentIndex + 1) % ACCENTS.length;
    setAccentColor(ACCENTS[nextIndex].color);
  };`
);

code = code.replace(
  /<button onClick=\{\(\) => setThemePreset[\s\S]*?<\/button>/,
  ''
);

code = code.replace(
  /<button onClick=\{\(\) => handleAccentChange\('blue', '#3b82f6'\)\}[\s\S]*?<\/button>/,
  `<button onClick={handleAccentCycle}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-left">
                <Layers3 size={14} className="text-accent shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-zinc-300">Accent</div>
                  <div className="text-[10px] text-zinc-500 truncate">Cycle</div>
                </div>
              </button>`
);

fs.writeFileSync('components/StartMenu.tsx', code);
console.log('patched StartMenu.tsx');
