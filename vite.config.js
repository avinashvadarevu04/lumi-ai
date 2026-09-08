import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // shadcn-style import root: `@/components/ui/...`, `@/lib/utils`
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Honour a port assigned by the host (e.g. the preview runner); fall back to Vite's default.
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
})
