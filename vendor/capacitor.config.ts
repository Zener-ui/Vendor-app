import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fidelx.vendor',
  appName: 'Fidelx Vendor',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: { androidScheme: 'https' },
};

export default config;
