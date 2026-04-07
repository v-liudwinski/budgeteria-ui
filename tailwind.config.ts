import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#7DD3FC',
          pink: '#F9A8D4',
          bg: '#F0F9FF',
          surface: '#FFFFFF',
          border: '#E0F2FE',
          navy: '#1E3A5F',
          muted: '#94A3B8',
          success: '#34D399',
          warning: '#FBBF24',
          danger: '#FB7185',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 16px 0 rgba(125, 211, 252, 0.10)',
        card: '0 1px 8px 0 rgba(125, 211, 252, 0.08)',
      },
    },
  },
} satisfies Config
