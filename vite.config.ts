import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  /*test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      name: 'chromium',
    }
  },*/
  build: {
    target: "ES2020",
    outDir: 'dist',
    minify: false,
    rollupOptions: {
      input: {
        index: './index.html',
        'js/background': './src/background.ts',
        'js/content_scripts': './src/contentScript.ts',
        'css/app': './src/App.css',
        'css/accordion.css': './src/assets/css/accordion.css',
        'fonts/pacifico.woff2': './src/assets/fonts/pacifico.woff2',
        'css/index.css': './src/assets/css/index.css',
        'css/output.css': './src/assets/css/output.css',
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          console.log(assetInfo.name, assetInfo.type)
          if (assetInfo.name == "pacifico.woff2") return "fonts/pacifico.woff2";
          return assetInfo.name as string;
        }
      }
    }
  },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx", ".css", ".woff2"]
  }
})
