import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { UserConfig } from 'vite';

import { defineConfig, loadEnv } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const webAdminDir = path.resolve(dirname, '../web-admin');

export default defineConfig((): UserConfig => {
  const env = loadEnv('desktop', webAdminDir, '');
  const desktopApiTarget = env.VITE_DESKTOP_API_TARGET;

  if (!desktopApiTarget) {
    throw new Error(
      'Missing VITE_DESKTOP_API_TARGET in apps/web-admin/.env.desktop',
    );
  }

  return {
    build: {
      emptyOutDir: true,
      outDir: 'dist-electron',
      rollupOptions: {
        external: ['electron'],
        input: {
          main: 'electron/main.ts',
          preload: 'electron/preload.ts',
        },
        output: {
          entryFileNames: '[name].js',
          format: 'es',
        },
      },
      ssr: true,
      target: 'node20',
    },
    define: {
      __DESKTOP_API_TARGET__: JSON.stringify(desktopApiTarget),
    },
  };
});
