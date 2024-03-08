// vitest.config.ts
import path from 'path'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    exclude: [...configDefaults.exclude, 'tests/**'],
    alias: {
      '@domain': path.join(__dirname, 'domain'),
      '@application': path.join(__dirname, 'application'),
      '@adapters': path.join(__dirname, 'adapters'),
    },
  },
})
