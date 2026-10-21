import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Área do paciente',
  robots: { index: false, follow: false },
};

export default function PacienteLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bone text-ink">{children}</div>;
}
