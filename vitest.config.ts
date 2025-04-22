import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts'

//@ts-ignore
export default mergeConfig(viteConfig, defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    testTimeout: 15000,
    browser: {
      provider: 'playwright', // or 'webdriverio'
      enabled: true,
      // at least one instance is required
      //@ts-ignore
      instances: [
        { browser: 'chromium' },
      ],
    },
  }
}));