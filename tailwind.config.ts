import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crextio: {
          bg: '#F5F3ED',
          card: '#FAF9F5',
          dark: '#1E1E1E',
          yellow: '#FDD868',
          purple: '#E5E5FF',
          green: '#E4F8E5',
          blue: '#0C54D9',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#3b82f6',
          500: '#1d63e8',
          600: '#0C54D9',
          700: '#0a46b5',
          800: '#093a96',
          900: '#0c327a',
          950: '#092152',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '32': '32px',
        '36': '36px',
      },
    },
  },
  plugins: [],
};
export default config;
