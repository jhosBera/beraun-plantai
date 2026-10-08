import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.beraun.plantai',
  appName: 'PlantAI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#064e3b',
    },
  },
};

export default config;
