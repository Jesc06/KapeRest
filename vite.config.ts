import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, //react fix port
    proxy: {
      '/api': {
        target: 'https://localhost:7214',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
