import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Clínica RS — Área do paciente',
    short_name: 'Clínica RS',
    description: 'Seus documentos e conteúdos do acompanhamento.',
    start_url: '/paciente',
    scope: '/paciente',
    display: 'standalone',
    background_color: '#F5F1EA',
    theme_color: '#1F1B16',
    lang: 'pt-BR',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
