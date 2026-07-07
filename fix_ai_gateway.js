const fs = require('fs');
let code = fs.readFileSync('services/aiProviders.ts', 'utf8');

const injection = `
      const raw = localStorage.getItem(PROVIDERS_STORAGE_KEY);
      if (raw) {
        this.providers = JSON.parse(raw);
        // Ensure nexus provider is always present
        if (!this.providers.find(p => p.id === 'nexus')) {
          const nexus = PROVIDER_PRESETS.find(p => p.id === 'nexus');
          if (nexus) {
            this.providers.unshift({ ...nexus, apiKey: 'nexus-builtin-key', enabled: true });
            this.activeProviderId = 'nexus';
            this.saveProviders();
          }
        }
      } else {
`;

code = code.replace(
  /const raw = localStorage\.getItem\(PROVIDERS_STORAGE_KEY\);\s+if \(raw\) \{\s+this\.providers = JSON\.parse\(raw\);\s+\} else \{/,
  injection.trim() + " {"
);

fs.writeFileSync('services/aiProviders.ts', code);
console.log("Fixed AI Gateway old cache.");
