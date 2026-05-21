import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta editorial — tons quentes, neutros e sofisticados
        bone:      '#F5F1EA',  // off-white principal (fundo)
        ivory:     '#FAF7F2',  // off-white claro
        sand:      '#E8DFD2',  // areia (cartões/divisões)
        clay:      '#C9B8A1',  // bege médio
        terracotta:'#A66E4E',  // acento terroso quente
        umber:     '#6B4F3A',  // marrom profundo
        ink:       '#1F1B16',  // “preto” desaturado para texto
        graphite:  '#3D362E',  // texto secundário
        ash:       '#8A7F73',  // texto auxiliar
        mist:      '#D9D1C5',  // borda sutil
      },
      fontFamily: {
        // Serifa display (Fraunces) e sans neutra (Inter)
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Escala tipográfica editorial
        'display-xl': ['clamp(3.5rem, 9vw, 8rem)',  { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.75rem, 6.5vw, 5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(2rem, 4.5vw, 3.75rem)',{ lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(1.5rem, 3vw, 2.25rem)',{ lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'eyebrow':    ['0.72rem',  { lineHeight: '1.4', letterSpacing: '0.22em' }],
      },
      letterSpacing: {
        editorial: '0.22em',
        tightest: '-0.04em',
      },
      maxWidth: {
        editorial: '76rem',
        prose: '38rem',
      },
      spacing: {
        section: 'clamp(6rem, 12vw, 10rem)',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-up': 'fadeUp 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'reveal':  'reveal 1.2s cubic-bezier(0.77, 0, 0.18, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        reveal: {
          '0%':   { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
