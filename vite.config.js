import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes the server to the LAN
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
