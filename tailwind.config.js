/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cesfam: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#009fe3', // Bright active blue (Mockup matching)
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0f3b60', // Institutional dark blue (Mockup button)
          950: '#0a2540',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'active-pill': '0 4px 14px 0 rgba(0, 159, 227, 0.35)',
      }
    },
  },
  plugins: [],
}
