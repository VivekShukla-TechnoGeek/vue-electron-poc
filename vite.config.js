import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';

export default defineConfig({
  plugins: [
    vue(),
    electron({
      entry: 'electron/background.js'
    })
  ],
  build: {
    outDir: 'dist',  // ✅ Make sure output matches Electron’s expectation
    emptyOutDir: true
  }
});
