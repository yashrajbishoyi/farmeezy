/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand Palette (Editorial Warm Fintech System)
        canvas: '#F5F4F0',
        paper: '#FFFFFF',
        ink: {
          DEFAULT: '#14231C',
          light: '#23372E',
        },
        dusk: {
          DEFAULT: '#1F3A2E',
          deep: '#182E24',
          surface: '#244537',
        },
        muted: {
          DEFAULT: '#5C6259',
          light: '#7A8177',
        },
        hairline: '#E3E1D9',
        
        // Exact Risk Scale System (Reserved Exclusively for Risk Data)
        risk: {
          low: '#2F9E5C',
          mod: '#D9A62E',
          high: '#E0722F',
          crit: '#C13B3B',
        },

        // Backward-compatible semantic tokens
        background: '#F5F4F0',
        foreground: '#14231C',
        border: '#E3E1D9',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      letterSpacing: {
        eyebrow: '0.08em',
      },
    },
  },
  plugins: [],
};
