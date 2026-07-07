import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy for Gemini API
  app.post("/api/gemini/models/:modelId", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: { message: "GEMINI_API_KEY not configured on server" } });
      }
      
      const endpoint = req.params.modelId.split(':')[1];
      const modelId = req.params.modelId.split(':')[0];
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:${endpoint}?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      
      res.status(response.status);
      for (const [key, value] of response.headers.entries()) {
        res.setHeader(key, value);
      }
      
      if (response.body) {
        // use node-fetch readable stream interop or native WebStream reader
        // since Node 18 fetch returns WebStream
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
