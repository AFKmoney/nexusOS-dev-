const fs = require('fs');

let content = fs.readFileSync('services/aiProviders.ts', 'utf8');

const nexusProvider = `  {
    id: 'nexus',
    name: 'Nexus Cloud (Built-in)',
    type: 'google',
    baseUrl: '/api/gemini',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
    maxTokens: 8192,
  },`;

content = content.replace('export const PROVIDER_PRESETS: Omit<AIProvider, \'apiKey\' | \'enabled\'>[] = [', 'export const PROVIDER_PRESETS: Omit<AIProvider, \'apiKey\' | \'enabled\'>[] = [\n' + nexusProvider);

content = content.replace(
  `this.providers = PROVIDER_PRESETS.map(p => ({\n          ...p,\n          apiKey: '',\n          enabled: false,\n        }));`,
  `this.providers = PROVIDER_PRESETS.map(p => ({\n          ...p,\n          apiKey: p.id === 'nexus' ? 'nexus-builtin-key' : '',\n          enabled: p.id === 'nexus',\n        }));\n        this.activeProviderId = 'nexus';`
);

content = content.replace(
  `this.providers = PROVIDER_PRESETS.map(p => ({\n        ...p,\n        apiKey: '',\n        enabled: false,\n      }));`,
  `this.providers = PROVIDER_PRESETS.map(p => ({\n        ...p,\n        apiKey: p.id === 'nexus' ? 'nexus-builtin-key' : '',\n        enabled: p.id === 'nexus',\n      }));\n      this.activeProviderId = 'nexus';`
);

fs.writeFileSync('services/aiProviders.ts', content);
console.log("Updated aiProviders.ts");
