import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Defaults only — base '/' and outDir 'dist' are exactly what Vercel expects
// for a static Vite build, so no extra config is needed to deploy.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
  },
})
