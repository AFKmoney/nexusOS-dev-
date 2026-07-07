const fs = require('fs');
let code = fs.readFileSync('services/aiProviders.ts', 'utf8');

const replacement = `
      const active = localStorage.getItem(ACTIVE_PROVIDER_KEY);
      if (active) this.activeProviderId = active;
      
      // Fallback: If the active provider is not enabled, default to nexus
      const currentActive = this.providers.find(p => p.id === this.activeProviderId);
      if (!currentActive || !currentActive.enabled) {
          const nexus = this.providers.find(p => p.id === 'nexus');
          if (nexus) {
              nexus.enabled = true;
              nexus.apiKey = 'nexus-builtin-key';
              this.activeProviderId = 'nexus';
              this.saveProviders();
          }
      }
`;

code = code.replace(
  /const active = localStorage\.getItem\(ACTIVE_PROVIDER_KEY\);\s+if \(active\) this\.activeProviderId = active;/,
  replacement.trim()
);

fs.writeFileSync('services/aiProviders.ts', code);
console.log("Fixed AI Provider fallback logic.");
