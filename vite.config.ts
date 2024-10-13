import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      name: 'chromium',
    }
  },
  build: {
    target: "ES2020",
    outDir: 'dist',
    minify: false,
    rollupOptions: {
      input:{
        index: './index.html',
        'js/background': './src/background.ts',
        'js/content_scripts': './src/contentScript.ts',
        'css/app': './src/App.css',
        'css/accordion.css': './src/assets/css/accordion.css'
      },
      output:{
        entryFileNames: "[name].js",
      }
    }
  },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx", ".css"]
  }
})
