import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Área do paciente',
  robots: { index: false, follow: false },
  icons: { apple: '/icons/icon-180.png' },
  appleWebApp: { capable: true, title: 'Clínica RS', statusBarStyle: 'default' },
};

export default function PacienteLayout({ children }: { children: React.ReactNode }) {
  return <div className="tema-vidro min-h-screen">{children}</div>;
}
