const fs = require('fs');

let code = fs.readFileSync('services/aiProviders.ts', 'utf8');

// Remove nexus provider from presets
code = code.replace(
  /\{\s*id:\s*'nexus',\s*name:\s*'Nexus Cloud \(Built-in\)',\s*type:\s*'google',\s*baseUrl:\s*'\/api\/gemini',\s*defaultModel:\s*'gemini-2.5-flash',\s*models:\s*\['gemini-2.5-flash', 'gemini-2.5-pro'\],\s*maxTokens:\s*8192,\s*\},/g,
  ''
);

// Update loadProviders logic
code = code.replace(
  /\/\/ Ensure nexus provider is always present[\s\S]*?if \(!this\.providers\.find\(p => p\.id === 'nexus'\)\) \{[\s\S]*?const nexus = PROVIDER_PRESETS\.find\(p => p\.id === 'nexus'\);[\s\S]*?if \(nexus\) \{[\s\S]*?this\.providers\.unshift\(\{ \.\.\.nexus, apiKey: 'nexus-builtin-key', enabled: true \}\);[\s\S]*?this\.activeProviderId = 'nexus';[\s\S]*?this\.saveProviders\(\);[\s\S]*?\}[\s\S]*?\}/g,
  `// Ensure google provider is always present
        if (!this.providers.find(p => p.id === 'google')) {
          const google = PROVIDER_PRESETS.find(p => p.id === 'google');
          if (google) {
            this.providers.unshift({ ...google, apiKey: '', enabled: true });
            this.activeProviderId = 'google';
            this.saveProviders();
          }
        }`
);

// Fallbacks
code = code.replace(
  /apiKey: p\.id === 'nexus' \? 'nexus-builtin-key' : '',/g,
  "apiKey: '',"
);

code = code.replace(
  /enabled: p\.id === 'nexus',/g,
  "enabled: p.id === 'google',"
);

code = code.replace(
  /this\.activeProviderId = 'nexus';/g,
  "this.activeProviderId = 'google';"
);

code = code.replace(
  /\/\/ Fallback: If the active provider is not enabled, default to nexus[\s\S]*?const currentActive = this\.providers\.find\(p => p\.id === this\.activeProviderId\);[\s\S]*?if \(!currentActive \|\| !currentActive\.enabled\) \{[\s\S]*?const nexus = this\.providers\.find\(p => p\.id === 'nexus'\);[\s\S]*?if \(nexus\) \{[\s\S]*?nexus\.enabled = true;[\s\S]*?nexus\.apiKey = 'nexus-builtin-key';[\s\S]*?this\.activeProviderId = 'nexus';[\s\S]*?this\.saveProviders\(\);[\s\S]*?\}[\s\S]*?\}/g,
  `// Fallback: If the active provider is not enabled, default to google
      const currentActive = this.providers.find(p => p.id === this.activeProviderId);
      if (!currentActive || !currentActive.enabled) {
          const google = this.providers.find(p => p.id === 'google');
          if (google) {
              google.enabled = true;
              this.activeProviderId = 'google';
              this.saveProviders();
          }
      }`
);

fs.writeFileSync('services/aiProviders.ts', code);
console.log('patched aiProviders.ts');
