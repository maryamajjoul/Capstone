// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Allows imports like import Component from 'src/components/Component'
      'src': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173, // Your frontend dev port
    proxy: {
      // Proxy requests starting with /api to your Spring Boot backend
      '/api': {
        target: 'http://localhost:8081', // Your gateway-admin backend URL
        changeOrigin: true, // Needed for virtual hosted sites
        // secure: false, // Uncomment if backend uses self-signed SSL cert
        // rewrite: (path) => path.replace(/^\/api/, ''), // Uncomment if backend doesn't expect /api prefix
      },
      // Remove the incorrect /login proxy if it existed
    },
  },
});