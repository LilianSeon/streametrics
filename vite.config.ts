import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

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
    target: ['ESNext'],
    outDir: 'dist',
    minify: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      input: {
        index: './index.html',
        'js/background': './src/background.ts',
        'js/content_scripts': './src/contentScript.ts',
        'css/accordion.css': './src/Chart/src/assets/css/accordion.css',
        'fonts/pacifico.woff2': './src/Chart/src/assets/fonts/pacifico.woff2',
        'css/index.css': './src/Chart/src/assets/css/index.css',
        'css/output.css': './src/Chart/src/assets/css/output.css',
        'images/logo-transparent.png': './src/Chart/src/assets/images/logo-transparent.png',
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name == "pacifico.woff2") return "fonts/pacifico.woff2";
          if (assetInfo.name == "logo-transparent.png") return "images/logo-transparent.png";
          return assetInfo.name as string;
        }
      }
    }
  },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx", ".css", ".woff2", ".png", ".mjs", ".cjs"]
  }
})
