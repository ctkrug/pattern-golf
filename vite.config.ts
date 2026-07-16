import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base: './' keeps all asset URLs relative so the built site works when
// served from a subpath (e.g. apps.charliekrug.com/pattern-golf).
export default defineConfig({
  base: './',
  // Emit the production build into site/ so the servable output is the page
  // published at apps.charliekrug.com/pattern-golf (site_build_dir = site).
  build: { outDir: 'site' },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
