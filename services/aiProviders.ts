// ═══════════════════════════════════════════════════════════════
// NEXUS AI PROVIDER GATEWAY — Universal Multi-Provider Engine
// Supports: OpenAI, Anthropic, Google, Groq, Mistral, DeepSeek,
//           OpenRouter, Together, Zhipu (GLM), xAI (Grok), Cerebras,
//           Perplexity, Fireworks, Ollama, LM Studio, and any
//           OpenAI-compatible endpoint.
// ═══════════════════════════════════════════════════════════════

export interface AIProvider {
  id: string;
  name: string;
  type: 'openai-compatible' | 'anthropic' | 'google';
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  models?: string[];
  enabled: boolean;
  maxTokens?: number;
  headers?: Record<string, string>;
}

// ─── Native function-calling types ─────────────────────────────
// These are provider-agnostic: each callX method translates the
// generic AITool[] into the provider-specific schema shape and
// parses the provider-specific tool-call response back into
// AIToolCall[]. Used by generateWithTools() for structured OS::
// actions instead of regex-parsing text.
export interface AITool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
}

export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface AIToolCallResult {
  text: string;
  toolCalls: AIToolCall[];
}

// Default provider presets (user provides their own API keys)
export const PROVIDER_PRESETS: Omit<AIProvider, 'apiKey' | 'enabled'>[] = [
  
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai-compatible',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4-turbo', 'o3-mini', 'o4-mini'],
    maxTokens: 4096,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-sonnet-4-20250514',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    maxTokens: 4096,
  },
  {
    id: 'google',
    name: 'Google Gemini',
    type: 'google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
    maxTokens: 8192,
  },
  {
    id: 'groq',
    name: 'Groq',
    type: 'openai-compatible',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it', 'deepseek-r1-distill-llama-70b', 'qwen-2.5-32b'],
    maxTokens: 4096,
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    type: 'openai-compatible',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest', 'mistral-nemo-latest', 'pixtral-12b-2409'],
    maxTokens: 4096,
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    type: 'openai-compatible',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    defaultModel: 'z-ai/glm-5.3',
    models: [
      'z-ai/glm-5.3',
      'nvidia/llama-3.1-nemotron-70b-instruct',
      'meta/llama-3.3-70b-instruct',
      'nvidia/llama-3.1-nemotron-ultra-253b-v1',
      'nvidia/nemotron-4-340b-instruct',
      'mistralai/mistral-large-2-instruct',
      'mistralai/mistral-7b-instruct-v0.3',
      'meta/llama-3.2-90b-vision-instruct',
      'meta/llama-3.2-11b-vision-instruct',
      'deepseek-ai/deepseek-v4-flash-0731',
      'deepseek-ai/deepseek-coder-6.7b-instruct',
      'google/gemma-4-31b-it',
      'google/gemma-3-12b-it',
      'ibm/granite-3.0-8b-instruct',
      'mistralai/codestral-22b-instruct-v0.1',
      '01-ai/yi-large',
    ],
    maxTokens: 16384,
  },
  {
    id: 'codestral',
    name: 'Codestral',
    type: 'openai-compatible',
    baseUrl: 'https://codestral.mistral.ai/v1',
    defaultModel: 'codestral-latest',
    models: ['codestral-latest', 'codestral-mamba-latest'],
    maxTokens: 4096,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'openai-compatible',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    maxTokens: 8192,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai-compatible',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    models: ['anthropic/claude-3.5-sonnet', 'anthropic/claude-3-opus', 'openai/gpt-4o', 'google/gemini-1.5-pro', 'meta-llama/llama-3.1-70b-instruct', 'meta-llama/llama-3.1-405b-instruct', 'mistralai/mistral-large'],
    maxTokens: 4096,
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI (GLM)',
    type: 'openai-compatible',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-5.3-flash',
    models: ['glm-5.3-flash', 'glm-5.3-flashx', 'glm-5.3', 'glm-4-plus', 'glm-4-air', 'glm-4-flash', 'glm-4'],
    maxTokens: 4096,
  },
  {
    id: 'together',
    name: 'Together AI',
    type: 'openai-compatible',
    baseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1', 'Qwen/Qwen2.5-72B-Instruct-Turbo', 'deepseek-ai/DeepSeek-R1'],
    maxTokens: 4096,
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    type: 'openai-compatible',
    baseUrl: 'http://127.0.0.1:11434/v1',
    defaultModel: 'llama3.2',
    models: ['llama3.2', 'llama3.1', 'mistral', 'codellama', 'phi3', 'gemma2'],
    maxTokens: 4096,
  },
  {
    id: 'lmstudio',
    name: 'LM Studio (Local)',
    type: 'openai-compatible',
    baseUrl: 'http://127.0.0.1:1234/v1',
    defaultModel: 'local-model',
    maxTokens: 4096,
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    type: 'openai-compatible',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-3-latest',
    models: ['grok-3-latest', 'grok-3-mini-latest', 'grok-2-latest', 'grok-2-1212', 'grok-2-vision-1212'],
    maxTokens: 4096,
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    type: 'openai-compatible',
    baseUrl: 'https://api.cerebras.ai/v1',
    defaultModel: 'llama-3.3-70b',
    models: ['llama-3.3-70b', 'llama3.1-70b', 'llama3.1-8b', 'qwen-3-32b'],
    maxTokens: 8192,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    type: 'openai-compatible',
    baseUrl: 'https://api.perplexity.ai',
    defaultModel: 'sonar-pro',
    models: ['sonar-pro', 'sonar', 'sonar-reasoning', 'sonar-reasoning-pro', 'sonar-deep-research'],
    maxTokens: 4096,
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    type: 'openai-compatible',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    models: [
      'accounts/fireworks/models/llama-v3p3-70b-instruct',
      'accounts/fireworks/models/deepseek-v3',
      'accounts/fireworks/models/deepseek-r1',
      'accounts/fireworks/models/qwen2p5-coder-32b-instruct',
      'accounts/fireworks/models/mixtral-8x22b-instruct',
    ],
    maxTokens: 4096,
  },
  {
    id: 'clod',
    name: 'Clod API',
    type: 'openai-compatible',
    baseUrl: 'https://api.clod.io/v1',
    // Default: trinity-mini (free tier — other models require quota replenishment)
    defaultModel: 'trinity-mini',
    models: [
      // ✅ Verified working on free tier
      'trinity-mini',
      // 🔒 Require team quota (upgrade at clod.io dashboard)
      'claude-sonnet-4-5',
      'claude-opus-4-5',
      'claude-opus-4-6',
      'claude-opus-4-7',
      'claude-haiku-4-5',
      'claude-sonnet-4-0',
      'claude-opus-4-0',
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4.1',
      'gpt-4-turbo',
      'gpt-5',
      'gpt-5-mini',
      'gpt-5-nano',
      'gpt-5.2',
      'gpt-5.3-codex',
      'openai/gpt-oss-120b',
      'OpenAI/gpt-oss-20B',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-3-flash-preview',
      'google/gemma-4-31B-it',
      'google/gemma-3n-E4B-it',
      'deepseek-ai/DeepSeek-R1',
      'deepseek-ai/DeepSeek-V4-Pro',
      'fireworks/deepseek-v3p2',
      'grok-3',
      'grok-4',
      'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      'meta-llama/Meta-Llama-3-8B-Instruct-Lite',
      'Meta-Llama-3.3-70B-Instruct',
      'llama3.1-8b',
      'Qwen/Qwen3-235B-A22B-Thinking-2507',
      'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8',
      'Qwen/Qwen2.5-7B-Instruct-Turbo',
      'moonshotai/Kimi-K2.5',
      'moonshotai/Kimi-K2.6',
      'MiniMaxAI/MiniMax-M2.5',
      'MiniMaxAI/MiniMax-M2.7',
      'zai-org/GLM-5',
      'zai-org/GLM-5.1',
    ],
    maxTokens: 32768,
  },
  {
    id: 'z-ai',
    name: 'Z.ai',
    type: 'openai-compatible',
    baseUrl: 'https://api.z.ai/api/paas/v4',
    defaultModel: 'glm-5.3-flash',
    models: [
      'glm-5.3-flash',
      'glm-5.3-flashx',
      'glm-5.3',
      'glm-5.2',
      'glm-4.7',
      'glm-4.6',
      'glm-4.5',
      'glm-4.5-flash',
    ],
    maxTokens: 32768,
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    type: 'openai-compatible',
    baseUrl: '',
    defaultModel: '',
    maxTokens: 4096,
  },
];

const PROVIDERS_STORAGE_KEY = 'nexus_ai_providers_v1';
const ACTIVE_PROVIDER_KEY = 'nexus_active_provider_v1';

// ─── Failover state ──────────────────────────────────────────────
// When a generate() / stream() call fails with a transient error
// (network timeout, 5xx response, fetch abort) we mark the provider as
// degraded for FAILOVER_COOLDOWN_MS. During that window, the gateway
// transparently routes to the next enabled provider with a configured
// API key. Once the cooldown expires, we retry the original provider
// on the next call. After FAILOVER_FAILURE_THRESHOLD consecutive
// failures the provider is degraded immediately.

const FAILOVER_COOLDOWN_MS = 60_000;       // 60 seconds in degraded state
const FAILOVER_FAILURE_THRESHOLD = 2;      // # of failures before degrading
const FAILOVER_TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

export interface ProviderHealth {
  failureCount: number;
  degradedUntil: number;
  lastError?: string;
}

/** Cooldown window after FAILOVER_FAILURE_THRESHOLD failures.
 *  Exposed for the Dashboard to render a countdown. */
export const FAILOVER_DEGRADED_WINDOW_MS = FAILOVER_COOLDOWN_MS;

/** Test if an error is worth retrying on a different provider. */
export function isTransientProviderError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message;
    if (/\b(5\d\d|408|425|429)\b/.test(msg)) return true;
    if (/timeout|aborted|network|fetch failed|ECONN|ENOTFOUND/i.test(msg)) return true;
  }
  return false;
}

function getProxyUrl(path: string = '/api/ai/proxy'): string {
  if (typeof window !== 'undefined') return path;
  return `http://localhost:3000${path}`;
}

function looksLikeHtml(body: string): boolean {
  const s = (body || '').trimStart().slice(0, 32).toLowerCase();
  return s.startsWith('<!doctype') || s.startsWith('<html') || s.startsWith('<head') || s.startsWith('<!--');
}

export class AIProviderGateway {
  private static instance: AIProviderGateway;
  private providers: AIProvider[] = [];
  private activeProviderId: string = 'lmstudio';
  private health: Map<string, ProviderHealth> = new Map();

  private constructor() {
    this.loadProviders();
  }

  private serverEnvChecked = false;
  private hasServerNvidiaKey = false;
  private hasServerGeminiKey = false;

  public static getInstance(): AIProviderGateway {
    if (!AIProviderGateway.instance) {
      AIProviderGateway.instance = new AIProviderGateway();
    }
    return AIProviderGateway.instance;
  }

  public async syncWithServerEnv(): Promise<{ hasNvidiaKey: boolean; hasGeminiKey: boolean; hasOpenaiKey: boolean }> {
    try {
      const url = getProxyUrl('/api/ai/env-status');
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        this.serverEnvChecked = true;
        this.hasServerNvidiaKey = Boolean(data.hasNvidiaKey);
        this.hasServerGeminiKey = Boolean(data.hasGeminiKey);

        if (this.hasServerGeminiKey) {
          const google = this.providers.find(p => p.id === 'google');
          if (google) {
            if (!google.apiKey || google.apiKey === '(Server Key Configured)') {
              google.apiKey = '(Server Key Configured)';
              google.enabled = true;
            }
          }
        }

        if (this.hasServerNvidiaKey) {
          const nvidia = this.providers.find(p => p.id === 'nvidia');
          if (nvidia) {
            if (!nvidia.apiKey || nvidia.apiKey === '(Server Key Configured)') {
              nvidia.apiKey = '(Server Key Configured)';
              nvidia.enabled = true;
            }
          }
        }

        // Active provider resolution:
        // Prioritize NVIDIA NIM when server key is available, or preserve valid user selection
        const currentActive = this.providers.find(p => p.id === this.activeProviderId);
        const currentActiveUsable = currentActive && currentActive.enabled && (
          (currentActive.apiKey && currentActive.apiKey.trim().length > 0) ||
          (currentActive.id === 'nvidia' && this.hasServerNvidiaKey) ||
          (currentActive.id === 'google' && this.hasServerGeminiKey) ||
          currentActive.id === 'lmstudio' ||
          currentActive.id === 'ollama'
        );

        if (!currentActiveUsable || this.activeProviderId === 'lmstudio' || this.activeProviderId === 'ollama') {
          if (this.hasServerNvidiaKey) {
            this.activeProviderId = 'nvidia';
          } else if (this.hasServerGeminiKey) {
            this.activeProviderId = 'google';
          }
        }

        this.saveProviders();
        return data;
      }
    } catch {}
    return { hasNvidiaKey: false, hasGeminiKey: false, hasOpenaiKey: false };
  }

  // ─── Storage ───────────────────────────────────────────────
  private loadProviders() {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(PROVIDERS_STORAGE_KEY) : null;
      if (raw) {
        this.providers = JSON.parse(raw);

        // Official Z.ai (GLM-5.3-Flash). Old preset pointed at api.z-ai.org which does not resolve.
        const zaiPreset = PROVIDER_PRESETS.find(p => p.id === 'z-ai');
        if (zaiPreset) {
          const zai = this.providers.find(p => p.id === 'z-ai');
          if (!zai) {
            this.providers.push({ ...zaiPreset, apiKey: '', enabled: false });
          } else {
            zai.name = zaiPreset.name;
            zai.baseUrl = zaiPreset.baseUrl;
            zai.models = zaiPreset.models;
            if (!zai.defaultModel || zai.defaultModel.startsWith('zai-org/') || zai.defaultModel === 'glm-4-plus') {
              zai.defaultModel = 'glm-5.3-flash';
            }
          }
          this.saveProviders();
        }

        // Ensure NVIDIA NIM provider is updated with valid endpoint & active model
        const nvidia = this.providers.find(p => p.id === 'nvidia');
        if (nvidia) {
          nvidia.baseUrl = 'https://integrate.api.nvidia.com/v1';
          if (!nvidia.defaultModel || nvidia.defaultModel.includes('llama-3.3-70b') || nvidia.defaultModel.includes('llama-3.1-405b') || nvidia.defaultModel.includes('nv-embed-v1')) {
            nvidia.defaultModel = 'z-ai/glm-5.3';
          }
          const preset = PROVIDER_PRESETS.find(p => p.id === 'nvidia');
          if (preset?.models) {
            nvidia.models = preset.models;
          }
          this.saveProviders();
        }

        // Ensure google provider is always present
        if (!this.providers.find(p => p.id === 'google')) {
          const google = PROVIDER_PRESETS.find(p => p.id === 'google');
          if (google) {
            this.providers.unshift({ ...google, apiKey: '', enabled: true });
            this.activeProviderId = 'google';
            this.saveProviders();
          }
        }
      } else {
        // First boot: seed from PROVIDER_PRESETS so the user has a
        // working provider list to configure (otherwise getActiveProvider
        // always returns null until they manually add providers).
        this.providers = PROVIDER_PRESETS.map(p => ({
          ...p,
          apiKey: '',
          enabled: p.id === 'google',
        }));
        this.activeProviderId = 'google';
        this.saveProviders();
      }
      const active = typeof localStorage !== 'undefined' ? localStorage.getItem(ACTIVE_PROVIDER_KEY) : null;
      if (active) this.activeProviderId = active;
      
      // Fallback: If the active provider is not enabled, default to google
      const currentActive = this.providers.find(p => p.id === this.activeProviderId);
      if (!currentActive || !currentActive.enabled) {
          const google = this.providers.find(p => p.id === 'google');
          if (google) {
              google.enabled = true;
              this.activeProviderId = 'google';
              this.saveProviders();
          }
      }
    } catch {
      // If localStorage is corrupt or unavailable, fall back to presets
      // so the gateway is still functional.
      this.providers = PROVIDER_PRESETS.map(p => ({
        ...p,
        apiKey: '',
        enabled: p.id === 'google',
      }));
      this.activeProviderId = 'google';
    }

    if (typeof window !== 'undefined') {
      setTimeout(() => this.syncWithServerEnv(), 50);
    }
  }

  private saveProviders() {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = JSON.stringify(this.providers);
      localStorage.setItem(PROVIDERS_STORAGE_KEY, data);
      localStorage.setItem(ACTIVE_PROVIDER_KEY, this.activeProviderId);
    } catch (e) {
      // Log the error so we can diagnose save failures
      console.error('[AI_GATEWAY] Failed to save providers:', e);
    }
  }

  // ─── Provider Management ───────────────────────────────────
  public getProviders(): AIProvider[] {
    // Return deep copies so React detects state changes properly.
    // Without this, mutations to provider objects (like apiKey) are
    // invisible to React's reconciliation and the UI doesn't update.
    return this.providers.map(p => ({ ...p }));
  }

  public getActiveProvider(): AIProvider | null {
    return this.providers.find(p => p.id === this.activeProviderId && p.enabled) || null;
  }

  public getActiveProviderId(): string {
    return this.activeProviderId;
  }

  public setActiveProvider(id: string) {
    this.activeProviderId = id;
    this.saveProviders();
  }

  public addProvider(provider: AIProvider) {
    const idx = this.providers.findIndex(p => p.id === provider.id);
    if (idx >= 0) {
      this.providers[idx] = provider;
    } else {
      this.providers.push(provider);
    }
    this.saveProviders();
  }

  public removeProvider(id: string) {
    this.providers = this.providers.filter(p => p.id !== id);
    if (this.activeProviderId === id) {
      this.activeProviderId = this.providers[0]?.id || 'lmstudio';
    }
    this.saveProviders();
  }

  public updateProviderKey(id: string, apiKey: string) {
    const cleanKey = apiKey.trim().replace(/^Bearer\s+/i, '');
    const idx = this.providers.findIndex(p => p.id === id);
    if (idx >= 0) {
      // Create a new object instead of mutating — ensures React sees the change
      this.providers[idx] = { ...this.providers[idx]!, apiKey: cleanKey, enabled: cleanKey.length > 0 };
      this.saveProviders();
    }
  }

  public hasConfiguredProvider(): boolean {
    return this.providers.some(p => p.enabled && p.apiKey);
  }

  // ─── Streaming proxy (SSE passthrough via Electron IPC) ────
  // Returns a ReadableStream<Uint8Array> whose bytes come from the
  // ai-proxy-stream IPC handler. Lets the renderer consume server-sent
  // events without tripping CORS preflight on the cloud AI endpoints.
  private electronStream(
    url: string,
    headers: Record<string, string>,
    body: string,
  ): ReadableStream<Uint8Array> {
    const channel = `ai-stream-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const electron = (window as any).electron;
    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      start(controller) {
        let closed = false;
        const cleanup = () => {
          if (closed) return;
          closed = true;
          try { electron.off(`${channel}-chunk`); } catch {}
          try { electron.off(`${channel}-done`); } catch {}
          try { electron.off(`${channel}-error`); } catch {}
        };

        electron.on(`${channel}-chunk`, (chunk: string) => {
          try { controller.enqueue(encoder.encode(chunk)); } catch {}
        });
        electron.on(`${channel}-done`, () => {
          cleanup();
          try { controller.close(); } catch {}
        });
        electron.on(`${channel}-error`, (err: any) => {
          cleanup();
          try {
            controller.error(new Error(err?.message || `Streaming proxy error (${err?.status || 0})`));
          } catch {}
        });

        electron.invoke('ai-proxy-stream', {
          url, method: 'POST', headers, body, channel,
        }).catch((err: any) => {
          cleanup();
          try { controller.error(err); } catch {}
        });
      },
      cancel() {
        const electron = (window as any).electron;
        try { electron.off(`${channel}-chunk`); } catch {}
        try { electron.off(`${channel}-done`); } catch {}
        try { electron.off(`${channel}-error`); } catch {}
      },
    });
  }

  // ─── Inference: OpenAI-Compatible ──────────────────────────
  private async callOpenAICompatible(
    provider: AIProvider,
    messages: Array<{ role: string; content: string }>,
    stream: false,
    model?: string,
    maxTokens?: number,
  ): Promise<string>;
  private async callOpenAICompatible(
    provider: AIProvider,
    messages: Array<{ role: string; content: string }>,
    stream: true,
    model?: string,
    maxTokens?: number,
  ): Promise<ReadableStream<Uint8Array>>;
  private async callOpenAICompatible(
    provider: AIProvider,
    messages: Array<{ role: string; content: string }>,
    stream: false,
    model: string | undefined,
    maxTokens: number | undefined,
    tools: AITool[],
  ): Promise<AIToolCallResult>;
  private async callOpenAICompatible(
    provider: AIProvider,
    messages: Array<{ role: string; content: string }>,
    stream: boolean,
    model?: string,
    maxTokens?: number,
    tools?: AITool[],
  ): Promise<string | ReadableStream<Uint8Array> | AIToolCallResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(provider.apiKey ? { 'Authorization': `Bearer ${provider.apiKey}` } : {}),
      ...(provider.headers || {}),
    };

    // OpenRouter requires extra headers
    if (provider.id === 'openrouter') {
      headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'https://nexusos.local';
      headers['X-Title'] = 'NexusOS';
    }

    // Normalize base URL to prevent 404s from trailing slashes or duplicate paths
    let cleanBase = (provider.baseUrl || '').trim().replace(/\/+$/, '');
    if (provider.id === 'nvidia') {
      cleanBase = 'https://integrate.api.nvidia.com/v1';
    }
    const url = cleanBase.endsWith('/chat/completions') ? cleanBase : `${cleanBase}/chat/completions`;

    // Build the request body. When `tools` is provided, we enable native
    // function calling by sending the OpenAI tool schema and `tool_choice: 'auto'`.
    const isNvidia = provider.id === 'nvidia';
    const isGlm = (model || provider.defaultModel || '').includes('glm');
    const temperature = isNvidia ? 0.5 : 0.7;
    const top_p = 1;
    const resolvedMaxTokens = Math.max(maxTokens || provider.maxTokens || 4096, (isGlm || isNvidia) ? 1024 : 256);

    const bodyObj: Record<string, unknown> = {
      model: model || provider.defaultModel || (isNvidia ? 'z-ai/glm-5.3' : undefined),
      messages,
      temperature,
      top_p,
      max_tokens: resolvedMaxTokens,
      stream,
    };
    const hasTools = !!(tools && tools.length > 0);
    if (hasTools) {
      bodyObj.tools = tools!.map(t => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
      bodyObj.tool_choice = 'auto';
    }
    if (provider.id === 'z-ai' || (model || '').includes('glm-5.3')) {
      bodyObj.thinking = { type: 'enabled' };
      bodyObj.reasoning_effort = 'low';
    }
    const bodyStr = JSON.stringify(bodyObj);

    // Local parser: extracts text and (if hasTools) tool_calls from an
    // OpenAI-format response. Supports reasoning_content for thinking models.
    const parseOpenAIResponse = (data: any): string | AIToolCallResult => {
      const msg = data?.choices?.[0]?.message;
      let content = (msg && typeof msg.content === 'string' && msg.content) || '';
      const reasoning = (msg && typeof msg.reasoning_content === 'string' && msg.reasoning_content) || '';

      // Clean response: use primary content, fallback to reasoning only if content is empty
      let text = content || reasoning || '';

      if (!hasTools) return text;
      const rawToolCalls = (msg && Array.isArray(msg.tool_calls)) ? msg.tool_calls : [];
      const toolCalls: AIToolCall[] = rawToolCalls.map((tc: any): AIToolCall => {
        let args: Record<string, unknown> = {};
        const argsRaw = tc?.function?.arguments;
        if (typeof argsRaw === 'string') {
          try { args = JSON.parse(argsRaw) as Record<string, unknown>; } catch { /* keep empty */ }
        } else if (argsRaw && typeof argsRaw === 'object') {
          args = argsRaw as Record<string, unknown>;
        }
        const id = (typeof tc?.id === 'string' && tc.id)
          ? tc.id
          : `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const name = (tc?.function?.name && typeof tc.function.name === 'string') ? tc.function.name : '';
        return { id, name, arguments: args };
      });
      return { text, toolCalls };
    };

    // Use Electron proxy to bypass CORS when available.
    // Browser direct fetch fails with "Failed to fetch" for most AI APIs
    // because they don't return Access-Control-Allow-Origin headers.
    const hasElectron = typeof window !== 'undefined'
      && (window as any).electron?.invoke
      && (window as any).electron?.on;

    if (hasElectron && stream) {
      return this.electronStream(url, headers, bodyStr);
    }

    if (hasElectron && !stream) {
      // Non-streaming: use IPC proxy
      try {
        const res = await (window as any).electron.invoke('ai-proxy', {
          url, method: 'POST', headers, body: bodyStr,
        });
        if (!res.ok) {
          const errBody = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
          throw new Error(`${provider.name} API Error ${res.status}: ${errBody.slice(0, 200)}`);
        }
        const data = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
        return parseOpenAIResponse(data);
      } catch (err: any) {
        // If proxy fails, fall through to direct fetch
        if (err.message?.includes('API Error')) throw err;
      }
    }

    // Use server-side proxy in browser mode for external cloud endpoints to bypass CORS and avoid third-party blocks
    const isLocalEndpoint = provider.baseUrl.includes('localhost') || provider.baseUrl.includes('127.0.0.1');
    const useServerProxy = !hasElectron && !isLocalEndpoint;

    let res: Response;
    const controller = new AbortController();
    const timeoutMs = stream ? 120000 : 90000;
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (useServerProxy) {
        res = await fetch(getProxyUrl('/api/ai/proxy'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            url,
            headers,
            body: bodyObj,
          }),
        });
        const probe = await res.clone().text();
        const html = looksLikeHtml(probe);
        if (html || !res.ok && probe.trimStart().startsWith('<')) {
          // Host served the SPA (or an HTML error page) instead of the Node proxy.
          res = await fetch(url, {
            method: 'POST',
            headers,
            signal: controller.signal,
            body: bodyStr,
          });
        }
      } else {
        res = await fetch(url, {
          method: 'POST',
          headers,
          signal: controller.signal,
          body: bodyStr,
        });
      }
    } catch (fetchErr: any) {
      if (fetchErr.name === 'AbortError') {
        throw new Error(`${provider.name} connection timed out after ${timeoutMs / 1000}s. The endpoint may be slow, queuing, or unreachable.`);
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutTimer);
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      let errMsg = errBody;
      try {
        const parsed = JSON.parse(errBody);
        errMsg = (typeof parsed.error === 'string' ? parsed.error : parsed.error?.message)
          || parsed.detail
          || parsed.message
          || parsed.title
          || errBody;
      } catch {}
      
      // Specifically handle NVIDIA NVCF function access / account permission errors
      if (errMsg.includes('Function') && errMsg.includes('Not found for account')) {
        errMsg = `Model '${bodyObj.model || provider.defaultModel}' is not authorized for your NVIDIA account/key. On build.nvidia.com, visit the model page to accept terms or select a standard model like 'nvidia/llama-3.1-nemotron-70b-instruct'. Original: ${errMsg}`;
      }

      throw new Error(`${provider.name} API Error ${res.status}: ${errMsg}`);
    }

    if (stream) {
      return res.body!;
    } else {
      const raw = await res.text();
      if (looksLikeHtml(raw)) {
        throw new Error(`${provider.name} returned a web page instead of JSON. Direct endpoint: ${url}`);
      }
      try {
        return parseOpenAIResponse(JSON.parse(raw));
      } catch {
        throw new Error(`${provider.name} sent non-JSON: ${raw.slice(0, 120)}`);
      }
    }
  }

  // ─── Inference: Anthropic ──────────────────────────────────
  private async callAnthropic(
    provider: AIProvider,
    messages: Array<{ role: string; content: string }>,
    stream: boolean,
    model?: string,
    maxTokens?: number,
    tools?: AITool[],
  ): Promise<string | ReadableStream<Uint8Array> | AIToolCallResult> {
    const systemMsg = messages.find(m => m.role === 'system')?.content || '';
    const userMsgs = messages.filter(m => m.role !== 'system');

    const url = `${provider.baseUrl}/v1/messages`;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    };
    // Anthropic tool schema uses `input_schema` (vs `parameters` in OpenAI).
    const bodyObj: Record<string, unknown> = {
      model: model || provider.defaultModel,
      max_tokens: maxTokens || provider.maxTokens || 4096,
      system: systemMsg,
      messages: userMsgs,
      stream,
    };
    const hasTools = !!(tools && tools.length > 0);
    if (hasTools) {
      bodyObj.tools = tools!.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }));
    }
    const bodyStr = JSON.stringify(bodyObj);

    // Local parser: Anthropic returns content as an array of blocks.
    // text blocks → natural-language response, tool_use blocks → tool calls.
    const parseAnthropicResponse = (data: any): string | AIToolCallResult => {
      const contentArr = (data && Array.isArray(data.content)) ? data.content : [];
      let text = '';
      const toolCalls: AIToolCall[] = [];
      for (const block of contentArr) {
        if (!block || typeof block !== 'object') continue;
        if (block.type === 'text' && typeof block.text === 'string') {
          text += block.text;
        } else if (block.type === 'tool_use') {
          const id = (typeof block.id === 'string' && block.id)
            ? block.id
            : `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const name = (typeof block.name === 'string') ? block.name : '';
          const input = (block.input && typeof block.input === 'object')
            ? block.input as Record<string, unknown>
            : {};
          toolCalls.push({ id, name, arguments: input });
        }
      }
      if (!hasTools) return text;
      return { text, toolCalls };
    };

    // Use Electron proxy for non-streaming to bypass CORS
    const hasElectron = typeof window !== 'undefined'
      && (window as any).electron?.invoke
      && (window as any).electron?.on;
    if (hasElectron && stream) {
      return this.electronStream(url, headers, bodyStr);
    }
    if (hasElectron && !stream) {
      try {
        const res = await (window as any).electron.invoke('ai-proxy', {
          url, method: 'POST', headers, body: bodyStr,
        });
        if (!res.ok) {
          const errBody = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
          throw new Error(`Anthropic API Error ${res.status}: ${errBody.slice(0, 200)}`);
        }
        const data = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
        return parseAnthropicResponse(data);
      } catch (err: any) {
        if (err.message?.includes('API Error')) throw err;
      }
    }

    const isLocalEndpoint = provider.baseUrl.includes('localhost') || provider.baseUrl.includes('127.0.0.1');
    const useServerProxy = !hasElectron && !isLocalEndpoint;

    let res: Response;
    if (useServerProxy) {
      res = await fetch(getProxyUrl('/api/ai/proxy'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          headers,
          body: bodyObj,
        }),
      });
    } else {
      res = await fetch(url, { method: 'POST', headers, body: bodyStr });
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      let errMsg = errBody;
      try {
        const parsed = JSON.parse(errBody);
        errMsg = parsed.error?.message || parsed.detail || parsed.message || errBody;
      } catch {}
      throw new Error(`Anthropic API Error ${res.status}: ${errMsg.slice(0, 200)}`);
    }

    if (stream) {
      return res.body!;
    } else {
      const data = await res.json();
      return parseAnthropicResponse(data);
    }
  }

  // ─── Inference: Google Gemini ───────────────────────────────
  private async callGoogle(
    provider: AIProvider,
    messages: Array<{ role: string; content: string }>,
    stream: boolean,
    model?: string,
    tools?: AITool[],
  ): Promise<string | ReadableStream<Uint8Array> | AIToolCallResult> {
    const modelId = model || provider.defaultModel;
    const endpoint = stream ? 'streamGenerateContent' : 'generateContent';
    let url = `${provider.baseUrl}/models/${modelId}:${endpoint}`;
    if (stream) {
      url += '?alt=sse';
    }

    const systemInstruction = messages.find(m => m.role === 'system')?.content;
    const contents = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Gemini expects tools wrapped in `functionDeclarations` arrays.
    const body: any = { contents };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }
    const hasTools = !!(tools && tools.length > 0);
    if (hasTools) {
      body.tools = [{
        functionDeclarations: tools!.map(t => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        })),
      }];
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-goog-api-key': provider.apiKey || '',
    };
    const bodyStr = JSON.stringify(body);

    // Local parser: Gemini returns parts that may contain either `text`
    // (natural language) or `functionCall` ({name, args}) blocks.
    const parseGoogleResponse = (data: any): string | AIToolCallResult => {
      const parts = data?.candidates?.[0]?.content?.parts;
      const partArr = (Array.isArray(parts)) ? parts : [];
      let text = '';
      const toolCalls: AIToolCall[] = [];
      for (const part of partArr) {
        if (!part || typeof part !== 'object') continue;
        if (typeof part.text === 'string') {
          text += part.text;
        }
        if (part.functionCall && typeof part.functionCall === 'object') {
          const fc = part.functionCall;
          const id = `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const name = (typeof fc.name === 'string') ? fc.name : '';
          const args = (fc.args && typeof fc.args === 'object')
            ? fc.args as Record<string, unknown>
            : {};
          toolCalls.push({ id, name, arguments: args });
        }
      }
      if (!hasTools) return text;
      return { text, toolCalls };
    };

    // Use Electron proxy for non-streaming to bypass CORS
    const hasElectron = typeof window !== 'undefined'
      && (window as any).electron?.invoke
      && (window as any).electron?.on;
    if (hasElectron && stream) {
      return this.electronStream(url, headers, bodyStr);
    }
    if (hasElectron && !stream) {
      try {
        const res = await (window as any).electron.invoke('ai-proxy', {
          url, method: 'POST', headers, body: bodyStr,
        });
        if (!res.ok) {
          const errBody = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
          throw new Error(`Gemini API Error ${res.status}: ${errBody.slice(0, 200)}`);
        }
        const data = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
        return parseGoogleResponse(data);
      } catch (err: any) {
        if (err.message?.includes('API Error')) throw err;
      }
    }

    // In web browser, proxy through /api/ai/proxy to handle CORS and inject GEMINI_API_KEY
    const useServerProxy = !hasElectron;
    let res: Response;
    if (useServerProxy) {
      res = await fetch(getProxyUrl('/api/ai/proxy'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          headers,
          body,
        }),
      });
    } else {
      res = await fetch(url, { method: 'POST', headers, body: bodyStr });
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      let errMsg = errBody;
      try {
        const parsed = JSON.parse(errBody);
        errMsg = parsed.error?.message || parsed.detail || parsed.message || errBody;
      } catch {}
      throw new Error(`Gemini API Error ${res.status}: ${errMsg.slice(0, 200)}`);
    }

    if (stream) {
      return res.body!;
    } else {
      const data = await res.json();
      return parseGoogleResponse(data);
    }
  }

  // ─── FIM: Fill-In-The-Middle Completion ────────────────────
  public async fimCompletion(
    prompt: string,
    suffix: string,
    model?: string,
    maxTokens?: number
  ): Promise<string> {
    const provider = this.getActiveProvider();
    if (!provider) throw new Error('No AI provider configured.');

    // Only Mistral/Codestral officially support this specific FIM endpoint
    if (provider.id === 'mistral' || provider.id === 'codestral') {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(provider.apiKey ? { 'Authorization': `Bearer ${provider.apiKey}` } : {}),
      };

      const res = await fetch(`${provider.baseUrl}/fim/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model || provider.defaultModel,
          prompt,
          suffix,
          temperature: 0.2,
          max_tokens: maxTokens || provider.maxTokens || 4096,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`${provider.name} FIM API Error ${res.status}: ${errBody.slice(0, 200)}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    }

    // Fallback for other providers: normal generation
    const fallbackPrompt = `Complete the following code. Return ONLY the code that should go between the PREFIX and SUFFIX.

PREFIX:
${prompt}

SUFFIX:
${suffix}`;

    return this.generate('', fallbackPrompt, model, maxTokens);
  }

  // ─── Health tracking ───────────────────────────────────────
  /** Mark a provider as having failed; degrades after threshold. */
  private markFailure(providerId: string, err: unknown): void {
    const health = this.health.get(providerId) ?? { failureCount: 0, degradedUntil: 0 };
    health.failureCount += 1;
    health.lastError = err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200);
    if (health.failureCount >= FAILOVER_FAILURE_THRESHOLD) {
      health.degradedUntil = Date.now() + FAILOVER_COOLDOWN_MS;
    }
    this.health.set(providerId, health);
  }

  /** Reset health on a successful call. */
  private markSuccess(providerId: string): void {
    this.health.set(providerId, { failureCount: 0, degradedUntil: 0 });
  }

  /** Returns true if the provider is currently in cooldown. */
  private isDegraded(providerId: string, now: number = Date.now()): boolean {
    const health = this.health.get(providerId);
    return !!health && now < health.degradedUntil;
  }

  /** Find the next eligible provider for failover: enabled, has an API key
   *  (or is local), not currently degraded, and not the one we just tried. */
  private findFailoverProvider(excludeId: string): AIProvider | null {
    const now = Date.now();
    for (const p of this.providers) {
      if (!p.enabled) continue;
      if (p.id === excludeId) continue;
      if (this.isDegraded(p.id, now)) continue;
      const isLocal = p.id === 'lmstudio' || p.id === 'ollama';
      if (!isLocal && !p.apiKey) continue;
      return p;
    }
    return null;
  }

  /** Health snapshot for the dashboard. */
  public getHealthSnapshot(): Record<string, ProviderHealth> {
    const out: Record<string, ProviderHealth> = {};
    for (const [id, h] of this.health) out[id] = { ...h };
    return out;
  }

  // ─── Unified Interface ─────────────────────────────────────
  /** One non-failover invocation against a specific provider. */
  private async generateOnce(
    provider: AIProvider,
    systemPrompt: string,
    userPrompt: string,
    model?: string,
    maxTokens?: number,
  ): Promise<string> {
    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });

    switch (provider.type) {
      case 'anthropic':
        return (await this.callAnthropic(provider, messages, false, model, maxTokens)) as string;
      case 'google':
        return (await this.callGoogle(provider, messages, false, model)) as string;
      case 'openai-compatible':
      default:
        return this.callOpenAICompatible(provider, messages, false, model, maxTokens);
    }
  }

  public async generate(
    systemPrompt: string,
    userPrompt: string,
    model?: string,
    maxTokens?: number,
  ): Promise<string> {
    const primary = this.getActiveProvider();
    if (!primary) throw new Error('No AI provider configured. Go to Settings > AI Providers.');

    // If the primary is degraded, try a failover provider first.
    let provider = this.isDegraded(primary.id) ? (this.findFailoverProvider(primary.id) ?? primary) : primary;

    try {
      const result = await this.generateOnce(provider, systemPrompt, userPrompt, model, maxTokens);
      this.markSuccess(provider.id);
      return result;
    } catch (err) {
      this.markFailure(provider.id, err);
      // Only attempt failover if the error is transient AND we have a
      // healthy alternative. Permanent errors (auth, bad request) propagate.
      if (isTransientProviderError(err)) {
        const fallback = this.findFailoverProvider(provider.id);
        if (fallback) {
          try {
            const result = await this.generateOnce(fallback, systemPrompt, userPrompt, model, maxTokens);
            this.markSuccess(fallback.id);
            return result;
          } catch (fallbackErr) {
            this.markFailure(fallback.id, fallbackErr);
            throw fallbackErr;
          }
        }
      }
      throw err;
    }
  }

  // ─── Native Function Calling ──────────────────────────────
  // Preferred path for OS:: actions: ask the model to emit structured
  // tool calls instead of OS::-prefixed text lines. Falls back to text
  // parsing in puterService.generateOnce if the provider doesn't support
  // tools (or if this method throws for any reason).
  /** One non-failover tool-enabled invocation against a specific provider. */
  private async generateWithToolsOnce(
    provider: AIProvider,
    systemPrompt: string,
    userPrompt: string,
    tools: AITool[],
    model?: string,
    maxTokens?: number,
  ): Promise<AIToolCallResult> {
    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });

    switch (provider.type) {
      case 'anthropic':
        return (await this.callAnthropic(provider, messages, false, model, maxTokens, tools)) as AIToolCallResult;
      case 'google':
        return (await this.callGoogle(provider, messages, false, model, tools)) as AIToolCallResult;
      case 'openai-compatible':
      default:
        return this.callOpenAICompatible(provider, messages, false, model, maxTokens, tools);
    }
  }

  /**
   * Generate with native function-calling support. Sends `tools` to the
   * provider and returns both natural-language text and structured tool
   * calls. Mirrors `generate()`'s failover behavior: tries the primary
   * provider, fails over to a healthy alternative on transient errors.
   */
  public async generateWithTools(
    systemPrompt: string,
    userPrompt: string,
    tools: AITool[],
    model?: string,
    maxTokens?: number,
  ): Promise<AIToolCallResult> {
    const primary = this.getActiveProvider();
    if (!primary) throw new Error('No AI provider configured. Go to Settings > AI Providers.');

    let provider = this.isDegraded(primary.id) ? (this.findFailoverProvider(primary.id) ?? primary) : primary;

    try {
      const result = await this.generateWithToolsOnce(provider, systemPrompt, userPrompt, tools, model, maxTokens);
      this.markSuccess(provider.id);
      return result;
    } catch (err) {
      this.markFailure(provider.id, err);
      if (isTransientProviderError(err)) {
        const fallback = this.findFailoverProvider(provider.id);
        if (fallback) {
          try {
            const result = await this.generateWithToolsOnce(fallback, systemPrompt, userPrompt, tools, model, maxTokens);
            this.markSuccess(fallback.id);
            return result;
          } catch (fallbackErr) {
            this.markFailure(fallback.id, fallbackErr);
            throw fallbackErr;
          }
        }
      }
      throw err;
    }
  }

  public async stream(
    systemPrompt: string,
    userPrompt: string,
    onToken: (text: string) => void,
    model?: string,
    maxTokens?: number,
  ): Promise<void> {
    const provider = this.getActiveProvider();
    if (!provider) throw new Error('No AI provider configured. Go to Settings > AI Providers.');

    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: userPrompt });

    let body: ReadableStream<Uint8Array>;
    switch (provider.type) {
      case 'anthropic':
        body = (await this.callAnthropic(provider, messages, true, model, maxTokens)) as ReadableStream<Uint8Array>;
        break;
      case 'google':
        body = (await this.callGoogle(provider, messages, true, model)) as ReadableStream<Uint8Array>;
        break;
      case 'openai-compatible':
      default:
        body = await this.callOpenAICompatible(provider, messages, true, model, maxTokens);
        break;
    }

    // Parse SSE stream
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Handle different stream formats
        if (provider.type === 'google') {
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const payload = trimmed.slice(6);
              if (payload === '[DONE]') continue;
              try {
                const data = JSON.parse(payload);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) onToken(text);
              } catch {}
            } else if (trimmed.startsWith('{')) {
              try {
                const data = JSON.parse(trimmed);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) onToken(text);
              } catch {}
            }
          }
        } else if (provider.type === 'anthropic') {
          // Anthropic SSE format
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const payload = trimmed.slice(6);
              if (payload === '[DONE]') continue;
              try {
                const data = JSON.parse(payload);
                if (data.type === 'content_block_delta') {
                  const text = data.delta?.text || '';
                  if (text) onToken(text);
                }
              } catch {}
            }
          }
        } else {
          // OpenAI SSE format
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
              try {
                const data = JSON.parse(trimmed.slice(6));
                const delta = data.choices?.[0]?.delta;
                const content = delta?.content || '';
                // Stream fluid content directly — internal reasoning stays internal
                if (content) {
                  onToken(content);
                }
              } catch {}
            }
          }
        }
      }
    } catch (streamErr: any) {
      const isAbort = streamErr?.name === 'AbortError' || streamErr?.name === 'TimeoutError' || /abort|timeout|closed/i.test(streamErr?.message || '');
      if (!isAbort) {
        throw streamErr;
      }
    } finally {
      reader.cancel().catch(() => {});
    }
  }

  // ─── Health Check ──────────────────────────────────────────
  public async testProvider(id: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const provider = this.providers.find(p => p.id === id);
    if (!provider) return { success: false, message: 'Provider not found', latencyMs: 0 };

    const isLocal = provider.id === 'lmstudio' || provider.id === 'ollama';
    const isNvidiaServerKey = provider.id === 'nvidia' && (this.hasServerNvidiaKey || provider.apiKey === '(Server Key Configured)');
    const isGeminiServerKey = provider.id === 'google' && (this.hasServerGeminiKey || provider.apiKey === '(Server Key Configured)');
    if (!isLocal && !isNvidiaServerKey && !isGeminiServerKey && !provider.apiKey?.trim()) {
      return { success: false, message: 'Please enter an API Key first before testing', latencyMs: 0 };
    }

    const start = performance.now();
    try {
      // Allow up to 90s for cloud endpoints, cold-starts, or models with reasoning phases
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out after 90s. The remote AI model may be queued or taking too long.')), 90000)
      );

      const targetModel = provider.defaultModel || (provider.models && provider.models[0]) || (provider.id === 'nvidia' ? 'z-ai/glm-5.3' : undefined);
      const result = await Promise.race([
        this.generateOnce(
          provider,
          'You are the AI engine of NexusOS.',
          'Respond with: NEXUS_CONNECTED',
          targetModel,
          1024
        ),
        timeoutPromise,
      ]);
      const latency = Math.round(performance.now() - start);
      const cleanResult = result.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim() || result.trim();
      return { success: true, message: `Connected: "${cleanResult.slice(0, 80)}"`, latencyMs: latency };
    } catch (e: any) {
      const latency = Math.round(performance.now() - start);
      return { success: false, message: e.message || 'Connection failed', latencyMs: latency };
    }
  }
}

export const aiGateway = AIProviderGateway.getInstance();
