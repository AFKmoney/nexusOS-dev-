const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  /useEffect\(\(\) => \{\s*localStorage\.setItem\('nexusos_desktop_positions', JSON\.stringify\(iconPositions\)\);\s*\}, \[iconPositions\]\);/g,
  `useEffect(() => {
    localStorage.setItem('nexusos_desktop_positions', JSON.stringify(iconPositions));
  }, [iconPositions]);

  // Rescue out-of-bounds icons
  useEffect(() => {
    let changed = false;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const newPos = { ...iconPositions };
    Object.entries(newPos).forEach(([name, pos]) => {
      if (pos.x < 0 || pos.y < 0 || pos.x > w - 80 || pos.y > h - 120) {
        delete newPos[name];
        changed = true;
      }
    });
    if (changed) {
      setIconPositions(newPos);
    }
  }, []);`
);

fs.writeFileSync('App.tsx', code);
console.log('patched out-of-bounds rescue');
