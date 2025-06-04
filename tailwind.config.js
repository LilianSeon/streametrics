/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.tsx", "./src/components/Chart/src/**/*.ts"],
  theme: {
    extend: {
      colors: {
        'darkColor': 'rgb(83, 83, 95, 0.38)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '0.75' },
        },
      }
    },
  },
  plugins: [],
  darkMode: 'selector',
}

