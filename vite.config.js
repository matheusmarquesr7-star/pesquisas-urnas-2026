import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const DIVERGENCES = new URL('./src/data/divergencias.md', import.meta.url);

/** Publica src/data/divergencias.md em /divergencias.md (no build e no servidor de desenvolvimento). */
function divergences() {
  return {
    name: 'divergencias',
    configureServer(server) {
      server.middlewares.use('/divergencias.md', (req, res) => {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.end(readFileSync(DIVERGENCES));
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'divergencias.md', source: readFileSync(DIVERGENCES, 'utf8') });
    },
  };
}

export default defineConfig({
  plugins: [divergences()],
  build: { target: 'es2022' },
});
