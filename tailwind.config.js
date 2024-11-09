/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.ts"],
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

