/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ou 'media' se preferir apenas do sistema
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-light': '#6D28D9', // Purple-600
        'primary-dark': '#8B5CF6',  // Purple-500 (um pouco mais claro para dark mode)
        'secondary-light': '#EC4899', // Pink-500
        'secondary-dark': '#F472B6',  // Pink-400
        'background-light': '#F9FAFB', // Gray-50
        'background-dark': '#111827',  // Gray-900
        'card-light': '#FFFFFF',
        'card-dark': '#1F2937',    // Gray-800
        'text-main-light': '#1F2937', // Gray-800
        'text-main-dark': '#F3F4F6',   // Gray-100
        'text-muted-light': '#6B7280', // Gray-500
        'text-muted-dark': '#9CA3AF',  // Gray-400
      },
    },
  },
  plugins: [],
};