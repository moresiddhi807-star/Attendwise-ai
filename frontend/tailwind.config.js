/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6D5DFC',
          50: '#F0EEFF',
          100: '#E1DEFF',
          200: '#C3BDFF',
          300: '#A59CFF',
          400: '#877BFF',
          500: '#6D5DFC',
          600: '#5142E8',
          700: '#3D2FD4',
          800: '#2C20B0',
          900: '#1E1580',
        },
        secondary: '#8B7FFF',
        accent: '#A78BFA',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #6D5DFC 0%, #A78BFA 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(109,93,252,0.1) 0%, rgba(167,139,250,0.05) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(109, 93, 252, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 40px rgba(109, 93, 252, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'count-up': 'countUp 1s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
