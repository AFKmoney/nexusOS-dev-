import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // General Web Proxy for WebRunner (bypasses CORS & X-Frame-Options)
  app.get("/api/proxy", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        return res.status(400).send("Missing 'url' parameter.");
      }

      let finalUrl = targetUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = "https://" + finalUrl;
      }

      console.log(`[Proxy] Fetching target: ${finalUrl}`);

      const response = await fetch(finalUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
        },
      });

      const contentType = response.headers.get("content-type") || "text/html";
      res.setHeader("Content-Type", contentType);

      // Disable X-Frame-Options and Content-Security-Policy to allow loading in iframes safely
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");

      if (
        !contentType.includes("text/html") &&
        !contentType.includes("application/json") &&
        !contentType.includes("text/plain") &&
        !contentType.includes("application/javascript") &&
        !contentType.includes("text/css")
      ) {
        // Binary stream (images, favicon, audio, video, etc.)
        const arrayBuffer = await response.arrayBuffer();
        return res.send(Buffer.from(arrayBuffer));
      }

      const text = await response.text();
      res.send(text);
    } catch (err: any) {
      console.error("[Proxy] error:", err);
      res.status(500).send(`Proxy failed to fetch the target URL: ${err.message}`);
    }
  });

  // Wildcard path-based proxy for resolving relative web resources correctly
  app.get(["/api/proxy/:protocol/:host", "/api/proxy/:protocol/:host/*path"], async (req, res) => {
    try {
      const { protocol, host } = req.params;
      const pathParam = (req.params as any).path;
      const pathSuffix = pathParam
        ? (Array.isArray(pathParam) ? pathParam.join("/") : pathParam)
        : "";
      const queryStr = req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";

      // Reconstruct target URL
      const finalUrl = `${protocol}://${host}/${pathSuffix}${queryStr}`;

      console.log(`[Path-Proxy] Fetching: ${finalUrl}`);

      const response = await fetch(finalUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
        },
      });

      const contentType = response.headers.get("content-type") || "application/octet-stream";
      res.setHeader("Content-Type", contentType);

      // Disable security headers that prevent iframe loads
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");

      if (
        !contentType.includes("text/html") &&
        !contentType.includes("application/json") &&
        !contentType.includes("text/plain") &&
        !contentType.includes("application/javascript") &&
        !contentType.includes("text/css")
      ) {
        // Binary stream
        const arrayBuffer = await response.arrayBuffer();
        return res.send(Buffer.from(arrayBuffer));
      }

      const text = await response.text();
      res.send(text);
    } catch (err: any) {
      console.error("[Path-Proxy] error:", err);
      res.status(500).send(`Path Proxy failed to fetch: ${err.message}`);
    }
  });

  // Universal AI Proxy for external LLM endpoints (NVIDIA NIM, OpenAI-compatible, etc.)
  app.post("/api/ai/proxy", async (req, res) => {
    try {
      let { url, headers: clientHeaders = {}, body } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Missing target 'url' in request body." });
      }

      // Normalize NVIDIA NIM URLs robustly to prevent 404s from trailing slashes, missing /v1, or duplicate paths
      let targetUrl = String(url);
      if (targetUrl.includes("nvidia.com")) {
        targetUrl = targetUrl.replace(/https?:\/\/[^/]+/, "https://integrate.api.nvidia.com");
        targetUrl = targetUrl.replace(/([^:])\/\/+/g, "$1/");
        if (!targetUrl.includes("/v1/") && !targetUrl.endsWith("/v1")) {
          targetUrl = targetUrl.replace("integrate.api.nvidia.com", "integrate.api.nvidia.com/v1");
          targetUrl = targetUrl.replace(/([^:])\/\/+/g, "$1/");
        }
        if (!targetUrl.includes("/chat/completions")) {
          targetUrl = targetUrl.replace(/\/+$/, "") + "/chat/completions";
        }
        if (targetUrl.includes("/chat/completions/chat/completions")) {
          targetUrl = targetUrl.replace("/chat/completions/chat/completions", "/chat/completions");
        }

        // If no Authorization header or placeholder was passed, check server environment
        const authHeader = clientHeaders["Authorization"] || clientHeaders["authorization"];
        if (
          !authHeader ||
          authHeader === "Bearer" ||
          authHeader === "Bearer dummy" ||
          authHeader === "Bearer " ||
          authHeader.includes("$NVIDIA_API_KEY") ||
          authHeader.includes("$API_KEY") ||
          authHeader.includes("Server Key")
        ) {
          const envKey = process.env.NVIDIA_API_KEY || process.env.NIM_API_KEY;
          if (envKey) {
            clientHeaders["Authorization"] = `Bearer ${envKey.trim()}`;
          }
        }

        // Ensure token budget for models with reasoning phases (like z-ai/glm-5.3)
        if (body && typeof body === "object" && !Array.isArray(body)) {
          const currentMax = Number((body as any).max_tokens);
          if (!currentMax || currentMax < 1024) {
            (body as any).max_tokens = 1024;
          }
          if ((body as any).temperature === undefined) {
            (body as any).temperature = 0.5;
          }
          if ((body as any).top_p === undefined) {
            (body as any).top_p = 1;
          }
        }
      }

      // Handle Google Gemini endpoints
      if (targetUrl.includes("googleapis.com")) {
        const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
        const googHeader = clientHeaders["x-goog-api-key"] || clientHeaders["X-Goog-Api-Key"];
        if (
          !googHeader ||
          googHeader === "(Server Key Configured)" ||
          googHeader === "dummy" ||
          googHeader.includes("$GEMINI_API_KEY")
        ) {
          if (geminiKey) {
            clientHeaders["x-goog-api-key"] = geminiKey;
          }
        }

        // If streaming and missing alt=sse, append it
        if (targetUrl.includes(":streamGenerateContent") && !targetUrl.includes("alt=sse")) {
          targetUrl += (targetUrl.includes("?") ? "&" : "?") + "alt=sse";
        }

        // Clean up or inject key query param if header might be dropped by certain proxies
        if (targetUrl.includes("key=") && targetUrl.includes("(Server Key Configured)")) {
          targetUrl = targetUrl.replace(/key=[^&]+/, `key=${encodeURIComponent(geminiKey)}`);
        } else if (!targetUrl.includes("key=") && geminiKey) {
          targetUrl += (targetUrl.includes("?") ? "&" : "?") + `key=${encodeURIComponent(geminiKey)}`;
        }
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream, */*",
        "User-Agent": "NexusOS/2.0",
        ...clientHeaders,
      };

      console.log(`[AI-Proxy] Forwarding to: ${targetUrl}`);

      const response = await fetch(targetUrl, {
        method: "POST",
        headers,
        signal: AbortSignal.timeout(120000),
        body: typeof body === "string" ? body : JSON.stringify(body),
      });

      const contentType = response.headers.get("content-type") || "application/json";
      res.status(response.status);

      if (contentType.includes("text/event-stream") && response.body) {
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no"); // Crucial for reverse-proxy (nginx) streaming
        if (typeof res.flushHeaders === "function") {
          res.flushHeaders();
        }

        const reader = response.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
            if (typeof (res as any).flush === "function") {
              (res as any).flush();
            }
          }
        } catch (streamErr) {
          console.warn("[AI-Proxy] Stream reading ended or client disconnected:", streamErr);
        } finally {
          reader.cancel().catch(() => {});
          res.end();
        }
      } else {
        res.setHeader("Content-Type", contentType);
        const text = await response.text();
        res.send(text);
      }
    } catch (err: any) {
      console.error("[AI-Proxy] Error:", err);
      if (err.name === "AbortError" || err.name === "TimeoutError") {
        res.status(504).json({ error: "Endpoint timed out after 90s. The remote AI model may be offline, queued, or taking too long." });
      } else {
        res.status(500).json({ error: `AI Proxy request failed: ${err.message}` });
      }
    }
  });

  // Query server-configured AI environment variables so client knows what's ready
  app.get("/api/ai/env-status", (req, res) => {
    res.json({
      hasNvidiaKey: Boolean(process.env.NVIDIA_API_KEY || process.env.NIM_API_KEY),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasOpenaiKey: Boolean(process.env.OPENAI_API_KEY),
    });
  });

  // Native OpenAI SDK endpoint anchored to the NexusOS Kernel context
  app.post("/api/ai/openai-chat", async (req, res) => {
    try {
      const {
        baseURL = "https://integrate.api.nvidia.com/v1",
        apiKey,
        model = "z-ai/glm-5.3",
        messages,
        temperature = 0.5,
        top_p = 1,
        max_tokens = 1024,
        stream = false,
      } = req.body;

      let resolvedKey = (typeof apiKey === "string" ? apiKey.trim() : "");
      if (!resolvedKey || resolvedKey.includes("$") || resolvedKey === "env" || resolvedKey === "Bearer" || resolvedKey.includes("Server Key")) {
        resolvedKey = process.env.NVIDIA_API_KEY || process.env.NIM_API_KEY || "";
      }

      if (!resolvedKey && baseURL.includes("nvidia.com")) {
        return res.status(400).json({ error: "NVIDIA_API_KEY is not configured on server or client." });
      }

      // Ensure the AI is firmly anchored in the NexusOS Kernel context so it does not diverge
      const NEXUS_OS_SYSTEM_PROMPT = `You are the NexusOS Sovereign Kernel AI Engine powered by Z-ai GLM-5.3 on NVIDIA NIM. You have full awareness and control over the operating system environment. When assisting the user, you act as the OS co-pilot and execute OS actions using OS tools or OS:: command syntax (e.g. OS::OPEN_APP:<appId>, OS::WRITE_FILE:<path>:<content>, OS::READ_FILE:<path>, OS::RUN_COMMAND:<cmd>, OS::NOTIFY:<title>:<msg>). Never break character or diverge into generic assistant behavior.`;

      let finalMessages: Array<{ role: string; content: string }> = Array.isArray(messages) ? [...messages] : [];
      const hasSystem = finalMessages.some(m => m.role === "system");
      if (!hasSystem) {
        finalMessages.unshift({ role: "system", content: NEXUS_OS_SYSTEM_PROMPT });
      } else {
        const sysMsg = finalMessages.find(m => m.role === "system");
        if (sysMsg && !sysMsg.content.includes("NexusOS")) {
          sysMsg.content = `${NEXUS_OS_SYSTEM_PROMPT}\n\n${sysMsg.content}`;
        }
      }

      const resolvedTokens = Math.max(Number(max_tokens) || 1024, 1024);

      const openai = new OpenAI({
        apiKey: resolvedKey,
        baseURL,
        timeout: 120000,
      });

      if (stream) {
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        if (typeof res.flushHeaders === "function") res.flushHeaders();

        const responseStream = await openai.chat.completions.create({
          model,
          messages: finalMessages as any,
          temperature,
          top_p,
          max_tokens: resolvedTokens,
          stream: true,
        });

        for await (const chunk of responseStream) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        const completion = await openai.chat.completions.create({
          model,
          messages: finalMessages as any,
          temperature,
          top_p,
          max_tokens: resolvedTokens,
          stream: false,
        });
        res.json(completion);
      }
    } catch (err: any) {
      console.error("[OpenAI-Chat] Error:", err.message);
      res.status(500).json({ error: err.message || "OpenAI request failed" });
    }
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
