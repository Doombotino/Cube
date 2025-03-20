import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    host: true,
    port: 5173,
    open: true // automatically open browser
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}); 