/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        sans:    ['"Hanken Grotesk"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0fdf4', 100: '#dcfce7',
          400: '#4ade80', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d',
        },
      },
    },
  },
  plugins: [],
}
