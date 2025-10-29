import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'



export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
     base: '/Sheet-to-image/',
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
