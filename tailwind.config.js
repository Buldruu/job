/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        cream: {
          50:  '#FDFCF8',
          100: '#FAF8F2',
          200: '#F4F0E6',
          300: '#EAE4D6',
          400: '#D8CFC0',
        },
        ink: {
          900: '#1C1917',
          700: '#3D3730',
          500: '#6B6058',
          300: '#A89F97',
          100: '#D4CEC8',
        },
        amber: {
          50:  '#FFF8F0',
          100: '#FEECD9',
          400: '#F5A623',
          500: '#E8891A',
          600: '#D4720F',
          700: '#B85E0A',
        },
        sage: {
          50:  '#F2F7F4',
          100: '#E0EDE5',
          400: '#6BA882',
          500: '#4E9468',
          600: '#3B7D53',
        },
        rose: {
          50:  '#FFF2F2',
          400: '#F87474',
          500: '#E85555',
        }
      },
      boxShadow: {
        'soft':   '0 2px 12px rgba(28,25,23,0.06)',
        'medium': '0 4px 24px rgba(28,25,23,0.10)',
        'card':   '0 1px 3px rgba(28,25,23,0.08), 0 4px 16px rgba(28,25,23,0.06)',
        'amber':  '0 4px 20px rgba(232,137,26,0.25)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
