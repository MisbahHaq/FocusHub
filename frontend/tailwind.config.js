/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './**/*.html',
    './**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
