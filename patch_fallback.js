const fs = require('fs');

let code = fs.readFileSync('services/aiProviders.ts', 'utf8');

code = code.replace(
  /\/\/ Fallback: If the active provider is not enabled, default to nexus[\s\S]*?if \(!currentActive \|\| !currentActive\.enabled\) \{[\s\S]*?const nexus = this\.providers\.find\(p => p\.id === 'nexus'\);[\s\S]*?if \(nexus\) \{[\s\S]*?nexus\.enabled = true;[\s\S]*?nexus\.apiKey = 'nexus-builtin-key';[\s\S]*?this\.activeProviderId = 'google';[\s\S]*?this\.saveProviders\(\);[\s\S]*?\}[\s\S]*?\}/g,
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
