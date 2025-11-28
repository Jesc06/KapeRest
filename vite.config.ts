import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Read optional NGROK_HOSTS environment variable for local dev when exposing via tunnels
// Example: NGROK_HOSTS="49c986d1c251.ngrok-free.app,brown-ads-care.loca.lt"
const NGROK_HOSTS = process.env.NGROK_HOSTS || '';
// Allow wildcard dev usage with NGROK_ALLOW_ALL_HOSTS=1 (not recommended for shared environments)
const NGROK_ALLOW_ALL_HOSTS = process.env.NGROK_ALLOW_ALL_HOSTS === '1';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, //react dev port
    // allow network access and optionally whitelist remote dev host headers (e.g. ngrok)
    host: true,
    allowedHosts: NGROK_ALLOW_ALL_HOSTS ? ['*'] : (NGROK_HOSTS ? [...NGROK_HOSTS.split(',').map(h => h.trim()), 'localhost'] : ['localhost']),
    // HMR over the external host (useful when the UI is opened from a public ngrok host)
    hmr: NGROK_HOSTS ? { protocol: 'wss', host: NGROK_HOSTS.split(',')[0].trim(), port: 443 } : undefined,
    proxy: {
      '/api': {
        target: 'https://localhost:7214',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
