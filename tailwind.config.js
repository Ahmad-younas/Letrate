/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        flash: {
          '0%': { backgroundColor: 'rgb(239 246 255)' }, // blue-50
          '50%': { backgroundColor: 'rgb(96 165 250)' }, // blue-400 (even brighter)
          '100%': { backgroundColor: 'rgb(239 246 255)' }, // back to blue-50
        },
      },
      animation: {
        flash: 'flash 0.4s ease-out 1 forwards',
      },
    },
  },
  plugins: [],
} 