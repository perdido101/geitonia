/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, sun-bleached Mediterranean palette (§11 style lock).
        ochre: '#c8781e',
        terracotta: '#b5533a',
        whitewash: '#f3e9d8',
        olive: '#6b7a3a',
        aegean: '#1d6a96',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
