/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#FDFBF7',
        'paper-dark': '#121212',
        'card-light': '#FFFFFF',
        'card-dark': '#1E1E1E',
        accent: {
          teal: '#00C2CB',
          yellow: '#FFD200',
          pink: '#FF0DFD',
          green: '#22C55E',
          orange: '#FF6B00',
          plant: '#16A34A',
        }
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo': '4px 4px 0px 0px #000000',
        'neo-lg': '6px 6px 0px 0px #000000',
        'neo-xl': '8px 8px 0px 0px #000000',
        'neo-teal': '4px 4px 0px 0px #00C2CB',
        'neo-yellow': '4px 4px 0px 0px #FFD200',
        'neo-pink': '4px 4px 0px 0px #FF0DFD',
        'neo-green': '4px 4px 0px 0px #22C55E',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
