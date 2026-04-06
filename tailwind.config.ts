import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // الخلفيات
        'bg-primary': '#0a0e1a',
        'bg-secondary': '#111827',
        'bg-card': '#1a2035',
        'bg-card-hover': '#1f2847',
        'bg-sidebar': '#0d1220',

        // النصوص
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',

        // الألوان الوظيفية
        'accent-blue': '#3b82f6',
        'accent-blue-glow': '#2563eb',
        'accent-green': '#22c55e',
        'accent-red': '#ef4444',
        'accent-amber': '#f59e0b',
        'accent-purple': '#8b5cf6',

        // الحدود
        'border-default': '#1e293b',
        'border-accent': '#334155',
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex-sans-arabic)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
