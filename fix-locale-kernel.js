const fs = require('fs');
const path = require('path');

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Replace empty calls
      content = content.replace(/\.toLocaleString\(\)/g, ".toLocaleString('en-US')");
      content = content.replace(/\.toLocaleDateString\(\)/g, ".toLocaleDateString('en-US')");
      content = content.replace(/\.toLocaleTimeString\(\)/g, ".toLocaleTimeString('en-US')");
      
      // Replace 'default'
      content = content.replace(/\.toLocaleString\('default'/g, ".toLocaleString('en-US'");
      content = content.replace(/\.toLocaleDateString\('default'/g, ".toLocaleDateString('en-US'");
      content = content.replace(/\.toLocaleTimeString\('default'/g, ".toLocaleTimeString('en-US'");
      
      // Replace []
      content = content.replace(/\.toLocaleString\(\[\]/g, ".toLocaleString('en-US'");
      content = content.replace(/\.toLocaleDateString\(\[\]/g, ".toLocaleDateString('en-US'");
      content = content.replace(/\.toLocaleTimeString\(\[\]/g, ".toLocaleTimeString('en-US'");

      // Replace undefined
      content = content.replace(/\.toLocaleString\(undefined/g, ".toLocaleString('en-US'");
      content = content.replace(/\.toLocaleDateString\(undefined/g, ".toLocaleDateString('en-US'");
      content = content.replace(/\.toLocaleTimeString\(undefined/g, ".toLocaleTimeString('en-US'");

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('./kernel');
processDir('./store');
processDir('./services');
