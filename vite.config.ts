import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom'],
          'lucide-icons': ['lucide-react'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Analyze bundle size
    chunkSizeWarningLimit: 500,
    // Enable source maps for better debugging
    sourcemap: false,
    // Minify the output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
