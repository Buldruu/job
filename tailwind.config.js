export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["'Manrope'", 'system-ui', 'sans-serif'],
        display: ["'Source Serif 4'", 'Georgia', 'serif'],
      },
      colors: {
        'charter-blue':    '#1A2B4A',
        'charter-blue-50': '#EEF1F6',
        'charter-blue-700':'#2A3D5E',
        'parchment':       '#F7F2E9',
        'parchment-deep':  '#EDE5D2',
        'seal-gold':       '#C9A961',
        'seal-gold-dark':  '#A8893F',
        'seal-gold-50':    '#FAF1DC',
        'verified-green':  '#2D7A4F',
        'heritage-red':    '#A63D40',
        'hairline':        '#D9D2C2',
        'hairline-soft':   '#E8E2D2',
        'steel':           '#6B7280',
        'steel-light':     '#9CA3AF',
        'ink':             '#1F1F1F',
        'paper':           '#FFFFFF',
        // Keep brand aliases for Tailwind class compat
        brand: { 50:'#EEF1F6', 100:'#D5DFF0', 500:'#1A2B4A', 600:'#162540', 700:'#2A3D5E' },
        surf:  { 50:'#F7F2E9', 100:'#EDE5D2', 200:'#D9D2C2' },
      },
    },
  },
  plugins: [],
}
