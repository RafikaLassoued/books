/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Cairo"', 'sans-serif'],
      },
      colors: {
        ink: { DEFAULT: '#1C1917', light: '#292524' },
        gold: { DEFAULT: '#C9A84C', light: '#E8C96A', dark: '#A07830' },
        cream: { DEFAULT: '#FDF8EE', dark: '#F5EDD8' },
        sage: { DEFAULT: '#5C7A5C', light: '#7A9E7A' },
        rust: { DEFAULT: '#C0392B', light: '#E74C3C' },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
