import crypto from 'node:crypto'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * The admin base path is compiled into the public bundle only as a SHA-256
 * digest, so the literal URL of the operations gateway cannot be recovered by
 * reading the shipped JavaScript. The real path lives in the lazily loaded
 * admin chunk, which is only fetched once the digest already matches.
 *
 * This is obfuscation, not access control: authentication is the real
 * boundary. It simply keeps the endpoint out of the hands of casual scanners.
 */
const hashPath = (value) => crypto.createHash('sha256').update(value).digest('hex')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const adminBasePath = (env.VITE_ADMIN_BASE_PATH || '/ops-gateway').replace(/\/$/, '')

  return {
    plugins: [react()],

    define: {
      __ADMIN_PATH_HASH__: JSON.stringify(hashPath(adminBasePath)),
    },

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
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
      },
    },
  }
})
