import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#1B5E20',
        eco: '#4CAF50',
        petrol: '#006064',
        sun: '#FBC02D',
        mist: '#F5F7F6',
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 18px 50px rgba(14, 57, 37, 0.10)' },
    },
  },
  plugins: [],
} satisfies Config
