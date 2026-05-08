import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '^/api/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // Faster build reporting
    reportCompressedSize: false,
    // esbuild minifier is the default and fastest; explicit for clarity
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Chunk vendor code so returning visitors get cache hits
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons:  ['lucide-react'],
        },
        // Consistent hashed filenames for long-term caching
        chunkFileNames:  'assets/[name]-[hash].js',
        entryFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash][extname]',
      },
    },
    // Inline small assets (< 8 KB) to save round trips on mobile
    assetsInlineLimit: 8192,
  },
})
