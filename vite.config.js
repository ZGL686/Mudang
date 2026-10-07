import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'experience-document-reload',
      handleHotUpdate({ file, server }) {
        // The archived graphics engine owns document globals. Reload its document
        // rather than remounting it against DOM already mutated by that engine.
        if (/source[\\/]features[\\/]experience[\\/]|source[\\/]main\.jsx|source[\\/]styles[\\/]experience|source[\\/]lib[\\/]asset-url\.js|public[\\/]vendor[\\/]experience/.test(file)) {
          server.ws.send({ type: 'full-reload' });
          return [];
        }
      },
    },
    react(),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./source', import.meta.url)) } },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        story: fileURLToPath(new URL('./experience.html', import.meta.url)),
      },
    },
  },
});
