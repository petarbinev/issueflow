import { defineConfig } from 'vite';
import { resolve } from 'node:path';
const pages = ['index', 'login', 'register', 'projects', 'issues', 'issue', 'issue-form', 'admin'];
export default defineConfig({
  build: { rollupOptions: { input: Object.fromEntries(pages.map(name => [name, resolve(import.meta.dirname, `${name}.html`)])) } },
});
