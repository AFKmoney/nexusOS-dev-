const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const correctProxy = `
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
      for (const [key, value] of response.headers.entries()) {
        res.setHeader(key, value);
      }
      
      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        res.end();
      }
    } catch (err: any) {
      console.error("[GEMINI] Proxy Error:", err);
      res.status(500).json({ error: { message: err.message } });
    }
  });
`;

content = content.replace(
  /app\.post\("\/api\/gemini\/models\/:modelId", async \(req, res\) => \{[\s\S]*?\}\);/,
  correctProxy.trim()
);

fs.writeFileSync('server.ts', content);
console.log("Updated server.ts streaming proxy");
