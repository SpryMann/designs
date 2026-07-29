import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

const projectsDir = resolve(__dirname, 'projects');
const projectEntries: Record<string, string> = {};

if (readdirSync(projectsDir).length > 0) {
  readdirSync(projectsDir).forEach((dir) => {
    const htmlPath = resolve(projectsDir, dir, 'index.html');
    projectEntries[`projects/${dir}/index`] = htmlPath;
  });
}

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rolldownOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...projectEntries,
      },
    },
  },
  server: {
    host: true,
    port: 3000,
  },
  base: '/designs/',
});
