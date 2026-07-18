import { defineConfig } from 'vite';

export default defineConfig({
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
});
