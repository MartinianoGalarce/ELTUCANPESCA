/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D6A2D',
          light:   '#3D8B3D',
          dark:    '#1E4D1E',
        },
        accent: {
          DEFAULT: '#E8870A',
          light:   '#F5A033',
          dark:    '#C46E08',
        },
        dark: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}