/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAFA',
        text: '#1A1A1A',
        muted: '#6B6B6B',
        border: '#E5E5E5',
        'card-hover': '#F5F5F5',
      },
      fontFamily: {
        serif: ['var(--font-noto-serif-kr)', 'Georgia', 'serif'],
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
