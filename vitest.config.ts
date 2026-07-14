import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Test config kept separate from vite.config.ts so the app build and the test
// runner don't fight over duplicated Vite type declarations. Engine tests are
// pure TypeScript and need no plugins.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
