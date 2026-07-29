/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './frontend/**/*.html',
    './frontend/**/*.js',
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
