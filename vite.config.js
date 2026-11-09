import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// [7] https://vite.dev/guide/static-deploy
const BASE = '/micro1-write-like-human-eval/'
export default defineConfig({
  base: BASE,
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false, assetsDir: 'assets' },
})
