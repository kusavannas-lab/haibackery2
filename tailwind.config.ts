import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          50: '#fdf8f4',
          100: '#faeee5',
          200: '#f5ddcc',
          300: '#eec3a7',
          400: '#e49f78',
          500: '#da7e50',
          600: '#cb6337',
          700: '#a94d2c',
          800: '#873f27',
          900: '#6d3523',
          950: '#2b1208',
        },
        honey: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        chocolate: {
          50: '#fcf8f6',
          100: '#f7ede8',
          200: '#efdbd2',
          300: '#dfbeb0',
          400: '#ca9b87',
          500: '#b57962',
          600: '#9b5d46',
          700: '#7e4835',
          800: '#683d2c',
          900: '#33170c',
          950: '#1e0c06',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
