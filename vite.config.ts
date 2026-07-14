import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// Base path: '/' locally, '/<repo>/' on GitHub Pages (set VITE_BASE in the deploy workflow).
const base = process.env.VITE_BASE ?? '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Γειτονιά',
        short_name: 'Geitonia',
        description: 'A Greek neighborhood shop tycoon.',
        theme_color: '#c8781e',
        background_color: '#f3e9d8',
        display: 'standalone',
        orientation: 'portrait',
        // Relative so the installed PWA works under the Pages subpath and at root alike.
        start_url: '.',
        scope: base,
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
});
