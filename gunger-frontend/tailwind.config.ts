import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ['var(--font-playfair)', 'Georgia', 'serif'],
        body: ['var(--font-special-elite)', 'Courier New', 'monospace'],
        mono: ['var(--font-jetbrains)', 'Courier New', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D0B08',
          soft: '#1A1612',
          muted: '#2E2A24',
        },
        paper: {
          DEFAULT: '#F4ECD8',
          dark: '#E8DCBF',
          aged: '#D4C49A',
        },
        gun: {
          red: '#C41E3A',
          'red-dark': '#8B1429',
          brass: '#B8860B',
          smoke: '#6B6560',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'flicker': 'flicker 3s infinite',
        'stamp': 'stamp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        flicker: {
          '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.85' },
          '25%': { opacity: '0.95' }, '75%': { opacity: '0.9' },
        },
        stamp: {
          from: { transform: 'scale(2) rotate(-15deg)', opacity: '0' },
          to: { transform: 'scale(1) rotate(-8deg)', opacity: '1' },
        },
      },
      backgroundImage: {
        'paper-texture': "url('/noise.svg')",
        'ink-lines': 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(0,0,0,0.04) 32px)',
      },
    },
  },
  plugins: [],
}

export default config
