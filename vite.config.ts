import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base: './' keeps all asset URLs relative so the built site works when
// served from a subpath (e.g. apps.charliekrug.com/pattern-golf).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
