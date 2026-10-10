import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  // three.js is deliberately NOT listed in manualChunks. It is reached only
  // through a dynamic import in components/HeroSection.jsx, so Rollup splits it
  // automatically; naming it as a manual chunk risks it being hoisted into the
  // entry's static import graph, which would defeat the lazy boundary.
})
