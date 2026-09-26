import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lazysiren.os',
  appName: 'LazySiren',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#050508',
  android: {
    allowMixedContent: true,
    backgroundColor: '#050508',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
