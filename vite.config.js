import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/QA': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/QA/, '/QA'),
        secure: false,
        headers: {
          'x-api-key': 'AIzaSyCR7AMuBCl2zj8wwX_xGxVGm6pWkA2vha'
        },
        timeout: 30000, // 30 seconds timeout
        proxyTimeout: 30000,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/register': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/logout': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/active-countries': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/hrpolicy-documents': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/qa': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/submit-feedback': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/uploadfile': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/file-details': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/file-report': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/toggle-file-active': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/delete-file-entries': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/active-users': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      timeout: 30000
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  }
}) 