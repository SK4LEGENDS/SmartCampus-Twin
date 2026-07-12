import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            if (err.code === 'ECONNREFUSED') {
              res.writeHead(503, {
                'Content-Type': 'text/plain',
              });
              res.end('Backend server is booting up. Please wait...');
              return;
            }
            console.error('Proxy error:', err);
          });
        }
      }
    }
  }
})
