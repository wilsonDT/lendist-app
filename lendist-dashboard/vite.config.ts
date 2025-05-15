import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path, { dirname } from 'path'; // Import path module and dirname
import { fileURLToPath } from 'url'; // Import fileURLToPath

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: { 
    alias: {
      '@': path.resolve(__dirname, './src'), // Corrected: Use the derived __dirname
      '@/lib/utils': path.resolve(__dirname, './src/lib/utils.ts') // Add specific alias
    },
  },
}); 