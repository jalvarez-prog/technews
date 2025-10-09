/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        base: '16px',
      },
      lineHeight: {
        relaxed: '1.5',
      },
    },
  },
  plugins: [],
};
