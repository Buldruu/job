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
          50:  '#f0f7ff',
          100: '#dceeff',
          200: '#b8deff',
          300: '#7ec4fd',
          400: '#38a3f8',
          500: '#0e86f0',
          600: '#0268cc',
          700: '#0254a6',
          800: '#064789',
          900: '#0b3c72',
        },
        surf: {
          50:  '#f8fafc',
          100: '#f0f5fa',
          200: '#e2ecf5',
          300: '#c8daea',
          400: '#94b8d4',
          500: '#5b90b5',
          600: '#3a6f96',
        },
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(14,134,240,0.07), 0 1px 4px 0 rgba(0,0,0,0.05)',
        'card-hover': '0 8px 32px 0 rgba(14,134,240,0.13), 0 2px 8px 0 rgba(0,0,0,0.07)',
        'btn': '0 2px 12px 0 rgba(14,134,240,0.30)',
      }
    },
  },
  plugins: [],
}
