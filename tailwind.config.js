/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.tsx", "./src/components/Chart/src/**/*.ts"],
  theme: {
    extend: {
      colors: {
        'darkColor': 'rgb(83, 83, 95, 0.38)'
      }
    },
  },
  plugins: [],
  darkMode: 'selector',
}

