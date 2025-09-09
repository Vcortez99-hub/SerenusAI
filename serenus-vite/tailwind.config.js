/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'headings': ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#E8F4F8',
          100: '#D6E8F5',
          200: '#9DC8E3',
          500: '#6B9BD1',
          600: '#5A85B8',
          700: '#4A6F9F',
        },
        green: {
          50: '#F0F9EC',
          100: '#E1F3D8',
          500: '#7FB069',
        },
        amber: {
          50: '#FFFBF0',
          100: '#F4E4C1',
        },
        neutral: {
          50: '#F5F5F0',
          100: '#F0F0ED',
          200: '#E5E5E0',
          800: '#2C3E50',
          900: '#1A2332',
        },
      },
      borderRadius: {
        'sm': '8px',
        'DEFAULT': '12px',
        'lg': '20px',
        'xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}