import { reactRouter } from '@react-router/dev/vite';

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
// import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    // devtoolsJson(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // or "modern"
      },
    },
  },
  resolve: {
    alias: {
      '@/app': '/src/app',
      '@/lib': '/src/lib',
      '@/components': '/src/components',
    },
  },
});
