/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: 'var(--color-page)',
        ink: 'var(--color-ink)',
        'ink-muted': 'var(--color-ink-muted)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-contrast': 'var(--color-primary-contrast)',
        sand: 'var(--color-sand)',
        'sand-border': 'var(--color-sand-border)',
        clay: 'var(--color-clay)',
        'clay-bg': 'var(--color-clay-bg)',
        sage: 'var(--color-sage)',
        'sage-text': 'var(--color-sage-text)',
        brick: 'var(--color-brick)',
        'brick-bg': 'var(--color-brick-bg)',
      },
      fontSize: {
        base: ['18px', { lineHeight: '1.6' }],
        lg: ['20px', { lineHeight: '1.5' }],
        xl: ['22px', { lineHeight: '1.4' }],
        '2xl': ['28px', { lineHeight: '1.3' }],
        '3xl': ['36px', { lineHeight: '1.2' }],
        '4xl': ['40px', { lineHeight: '1.15' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};
