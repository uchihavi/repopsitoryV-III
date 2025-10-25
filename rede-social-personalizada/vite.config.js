// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy para seu backend PHP (ajuste a URL/porta conforme seu XAMPP/Apache)
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // ex.: http://localhost/rede-social-personalizada/backend/api
        changeOrigin: true
      }
    }
  },
  build: {
    sourcemap: false
  }
})
