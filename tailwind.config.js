/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          50: '#EBEAFC',
          100: '#D7D5F9',
          200: '#AFABF3',
          300: '#8781ED',
          400: '#5F57E7',
          500: '#6366F1',
          600: '#2B3FD9',
          700: '#202FA5',
          800: '#162071',
          900: '#0D1040',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          50: '#F5F0FD',
          100: '#EBE1FB',
          200: '#D7C3F7',
          300: '#C3A5F3',
          400: '#AF87EF',
          500: '#8B5CF6',
          600: '#6B3FD9',
          700: '#4B2FA5',
          800: '#2B1F71',
          900: '#150F40',
        },
        accent: {
          DEFAULT: '#22D3EE',
          50: '#EBFAFC',
          100: '#D7F5F9',
          200: '#AFEBF3',
          300: '#87E1ED',
          400: '#5FCDE3',
          500: '#22D3EE',
          600: '#1AAFC9',
          700: '#138BA5',
          800: '#0D6781',
          900: '#06405F',
        },
        dark: {
          DEFAULT: '#0F172A',
          50: '#1E293B',
          100: '#334155',
          200: '#475569',
          300: '#64748B',
          400: '#94A3B8',
          500: '#CBD5E1',
          600: '#E2E8F0',
          700: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        heading: ['"Space Grotesk"', '"Noto Sans SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
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
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
