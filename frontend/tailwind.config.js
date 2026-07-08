/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'float-slow': 'float 8s ease-in-out infinite',
        'glow-pulse': 'glow 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}