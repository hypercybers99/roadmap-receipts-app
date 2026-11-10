import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function copy404Plugin() {
  return {
    name: 'copy-404',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist');
      const idx = path.join(dist, 'index.html');
      const fallback = path.join(dist, '404.html');
      if (fs.existsSync(idx)) {
        fs.copyFileSync(idx, fallback);
        console.log('[build] Generated dist/404.html SPA fallback from index.html');
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || process.env.BASE_URL || '/roadmap-receipts-app/',
  plugins: [react(), copy404Plugin()],
  server: {
    port: 3000,
  },
});
