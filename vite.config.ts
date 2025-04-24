import { defineConfig } from 'vite';
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
    chunkSizeWarningLimit: 2600,
    rollupOptions: {
      input: {
        index: './index.html',
        'js/background': './src/background.ts',
        'js/content_scripts': './src/contentScript.ts',
        'css/accordion.css': './src/components/Chart/src/assets/css/accordion.css',
        'fonts/pacifico.woff2': './src/components/Chart/src/assets/fonts/pacifico.woff2',
        'css/index.css': './src/components/Chart/src/assets/css/index.css',
        //'css/output.css': './src/components/Chart/src/assets/css/output.css',
        'images/logo-transparent.png': './src/components/Chart/src/assets/images/logo-transparent.png',
        'images/uk-flag.svg': './src/assets/images/uk-flag.svg',
        'images/fr-flag.svg': './src/assets/images/fr-flag.svg',
        /*'_locales/en/message.json': './src/_locales/en/message.json',
        '_locales/fr/message.json': './src/_locales/fr/message.json',*/
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name == "pacifico.woff2") return "fonts/pacifico.woff2";
          if (assetInfo.name == "logo-transparent.png") return "images/logo-transparent.png";
          if (assetInfo.name == "uk-flag.svg") return "images/uk-flag.svg";
          if (assetInfo.name == "fr-flag.svg") return "images/fr-flag.svg";
          return assetInfo.name as string;
        }
      }
    }
  },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx", ".css", ".woff2", ".png", ".mjs", ".cjs", ".svg"]
  }
})
