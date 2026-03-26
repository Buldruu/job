/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#4f63d2',
          600: '#3b4fc0',
          700: '#2d3fa8',
          900: '#1a2466',
        },
        dark: {
          900: '#0d0f1a',
          800: '#13162b',
          700: '#1a1f3a',
          600: '#232849',
          500: '#2d3360',
        }
      }
    },
  },
  plugins: [],
}
