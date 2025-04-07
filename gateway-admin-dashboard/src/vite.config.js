// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': {
        target: 'http://localhost:9080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
    },
  },
});
