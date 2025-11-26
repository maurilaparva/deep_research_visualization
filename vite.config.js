import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/deep_research_visualization/',
  plugins: [react()],
})