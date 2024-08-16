import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "ES2020",
    minify: false,
    rollupOptions: {
      input:{
        index: './index.html',
        'js/background': './src/background.ts',
        'js/content_scripts': './src/contentScript.ts',
        'css/app': './src/App.css'
      },
      output:{
        entryFileNames: "[name].js"
      }
    }
  }
})
