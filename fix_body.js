const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace('app.use(express.json());', 'app.use(express.json({ limit: "50mb" }));');
fs.writeFileSync('server.ts', content);
console.log("Fixed express json limit.");
