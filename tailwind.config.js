/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',
          green: '#16A34A',
          amber: '#F59E0B',
          red: '#DC2626',
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          'text-primary': '#0F172A',
          'text-secondary': '#64748B',
        }
      },
      borderRadius: {
        'xl': '12px',
      }
    },
  },
  plugins: [],
};
