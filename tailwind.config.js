/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brass: {
          50: '#FAF4E8',
          100: '#F4E7CC',
          200: '#E9D099',
          300: '#DFB866',
          400: '#D4A133',
          500: '#B9812E', // Primary warm brass
          600: '#996722',
          700: '#754B17',
          800: '#52320E',
          900: '#321D06',
        },
        paper: {
          light: '#FAF6EC', // Warm off-white paper tone
          card: '#FFFFFF',
          border: '#E6DEC8',
          dark: '#1C1914',  // Dark mode background
          darkCard: '#26221A', // Dark mode card background
          darkBorder: '#3D372E',
        },
        ink: {
          light: '#6E6759',
          DEFAULT: '#26221A', // Dark text / ink
          dark: '#0F0D0A',
        },
        status: {
          present: '#4C7A52',    // Forest Green
          presentBg: '#EAF3EC',
          halfDay: '#B9812E',    // Amber / Brass
          halfDayBg: '#FDF7EB',
          absent: '#A13D3D',     // Maroon
          absentBg: '#FDF0F0',
          balance: '#2F4858',    // Deep Navy
          balanceBg: '#EBF1F5',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Courier Prime', 'Consolas', 'Monaco', 'monospace'],
      },
      boxShadow: {
        stamp: '0 2px 0 0 rgba(0, 0, 0, 0.15)',
        'stamp-active': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        ledger: '0 4px 20px -2px rgba(38, 34, 26, 0.08)',
      }
    },
  },
  plugins: [],
}
