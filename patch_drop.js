const fs = require('fs');

let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  /const x = Math\.round\(\(e\.clientX - rect\.left\) \/ 10\) \* 10;\s*const y = Math\.round\(\(e\.clientY - rect\.top\) \/ 10\) \* 10;/g,
  `let x = Math.round((e.clientX - rect.left) / 10) * 10;
      let y = Math.round((e.clientY - rect.top) / 10) * 10;
      
      const maxX = rect.width - 96;
      const maxY = rect.height - 96;
      
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));`
);

fs.writeFileSync('App.tsx', code);
console.log('patched App.tsx bounds check');
