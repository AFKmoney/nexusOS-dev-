const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const geminiProxy = `
  // Proxy for Gemini API
  app.post("/api/gemini/models/:modelId", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: { message: "GEMINI_API_KEY not configured on server" } });
      }
      
      const endpoint = req.params.modelId.split(':')[1];
      const modelId = req.params.modelId.split(':')[0];
      
      const url = \`https://generativelanguage.googleapis.com/v1beta/models/\${modelId}:\${endpoint}\`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(req.body)
      });
      
      res.status(response.status);
      response.body.pipe(res);
      
    } catch (err: any) {
      console.error("[GEMINI] Proxy Error:", err);
      res.status(500).json({ error: { message: err.message } });
    }
  });
`;

content = content.replace(
  `  app.post("/api/gemini/generate", async (req, res) => {`,
  geminiProxy + `\n  app.post("/api/gemini/generate", async (req, res) => {`
);

fs.writeFileSync('server.ts', content);
console.log("Updated server.ts proxy");
