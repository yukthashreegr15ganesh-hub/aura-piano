/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf7',
          100: '#fbf7ee',
          200: '#f6eed6',
          300: '#eddcae',
          400: '#e0c27e',
          500: '#d4af37',
          600: '#b89228',
          700: '#926f1e',
          800: '#77571d',
          900: '#64481c',
        },
        studio: {
          black: '#07080a',
          darker: '#0c0d11',
          dark: '#12141a',
          surface: '#181b22',
          panel: 'rgba(22, 25, 34, 0.75)',
          border: 'rgba(212, 175, 55, 0.18)',
          borderHighlight: 'rgba(212, 175, 55, 0.45)',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'piano-glow': '0 0 35px -5px rgba(212, 175, 55, 0.25)',
        'amber-glow': '0 0 25px 2px rgba(245, 158, 11, 0.35)',
        'key-press': '0 2px 10px rgba(245, 158, 11, 0.5), inset 0 2px 8px rgba(0, 0, 0, 0.4)',
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
