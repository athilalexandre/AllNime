/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-light': '#6D28D9',
        'primary-dark': '#8B5CF6',
        'secondary-light': '#EC4899',
        'secondary-dark': '#F472B6',
        'background-light': '#F9FAFB',
        'background-dark': '#111827',
        'card-light': '#FFFFFF',
        'card-dark': '#1F2937',
        'text-main-light': '#1F2937',
        'text-main-dark': '#F3F4F6',
        'text-muted-light': '#6B7280',
        'text-muted-dark': '#9CA3AF',
      },
    },
  },
  plugins: [],
};
