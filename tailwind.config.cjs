module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        subtlePulse: {
          '0%': { transform: 'scale(0.98)', opacity: '0.85' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(0.98)', opacity: '0.85' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1.05)' },
          '33%': { transform: 'translate(60px, -70px) scale(1.12)' },
          '66%': { transform: 'translate(-55px, 55px) scale(0.96)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        subtlePulse: 'subtlePulse 2.8s ease-in-out infinite',
        blob: 'blob 26s ease-in-out infinite',
        gradientShift: 'gradientShift 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
