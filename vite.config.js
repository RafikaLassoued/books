import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Output directory for the production build
    outDir: 'dist',
    // Ensure the source maps are generated for debugging in production
    sourcemap: true,
    // Minify with esbuild for better performance
    minify: 'esbuild',
    // Rollup options for additional optimization
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          'supabase': [
            '@supabase/supabase-js',
          ],
          'ui': [
            'lucide-react',
            'react-hot-toast',
          ],
        },
      },
    },
  },
  // Server configuration for development
  server: {
    port: 5173,
    strictPort: false,
  },
  // Preview configuration
  preview: {
    port: 4173,
    strictPort: false,
  },
})
