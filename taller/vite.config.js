import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy solo activo en desarrollo local (vite dev server)
    // En producción (Vercel), las peticiones van directo al backend via VITE_API_URL
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // No reescribe el path: /api/tasks → http://localhost:3000/api/tasks
      },
    },
  },
});
