const fs = require('fs');

let code = fs.readFileSync('App.tsx', 'utf8');

code = code.replace(
  /const currentAccent = useOS\.getState\(\)\.accentColor;\s*themeEngine\.setCustomAccent\(currentAccent\);\s*themeEngine\.apply\(\);/g,
  ""
);

code = code.replace(
  /const desktopPath = getDesktopPath\(currentUserId\);/g,
  `const desktopPath = getDesktopPath(currentUserId);
  const accentColor = useOS((state) => state.accentColor);

  useEffect(() => {
    themeEngine.setCustomAccent(accentColor);
    themeEngine.apply();
  }, [accentColor]);`
);

fs.writeFileSync('App.tsx', code);
console.log('patched App.tsx');
