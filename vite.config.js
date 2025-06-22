import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build:{
    outDir:"../avalanche_2024/static",
    emptyOutDir:true,
    rollupOptions: {
      maxParallelFileOps: 5,
    }
  },
  server: {
    fs: {
      strict: false
    }
  }
})
