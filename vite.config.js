import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/deep_research_visualization/',
  plugins: [react()],
  server: {
    port: 5185, // fine for local dev
  },
})