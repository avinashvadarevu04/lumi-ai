import colors from 'tailwindcss/colors';

/**
 * Strict monochrome theme.
 * `theme.colors` is intentionally REPLACED (not extended) so that no chromatic
 * utility (blue-*, emerald-*, violet-*, …) can compile anywhere in the app.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      white: '#FFFFFF',
      neutral: colors.neutral,
      ink: {
        950: '#000000',
        900: '#080808',
        800: '#111111',
        700: '#161616',
        600: '#1C1C1C',
      },
      line: '#262626',
      silver: '#A1A1AA',
      graphite: '#71717A',
    },
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        hairline: '0 0 0 1px rgba(255,255,255,0.08)',
        card: '0 30px 80px -30px rgba(0,0,0,0.9)',
        glow: '0 0 40px rgba(255,255,255,0.08)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 40s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out both',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
};
