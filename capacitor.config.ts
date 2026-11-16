import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.starplay.ios',
  appName: '星映 StarPlay',
  webDir: 'www',
  ios: {
    contentInset: 'always',
    limitsNavigationsToAppBoundDomains: false,
    backgroundColor: '#0E0C1D',
  },
  server: {
    // 允许 http 源（iPad 局域网），生产可关
    cleartext: true,
  },
};

export default config;
