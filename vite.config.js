import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Replace 'your-repo-name' with your actual GitHub repo name
export default defineConfig({
  base: 'Sheet-to-image',
  plugins: [vue()],
})
