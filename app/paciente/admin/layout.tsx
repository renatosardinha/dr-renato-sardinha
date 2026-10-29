import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SideNav } from '@/components/paciente/NavLinks';

export const dynamic = 'force-dynamic';

const ITENS = [
  { href: '/paciente/admin', label: 'Visão geral', exact: true },
  { href: '/paciente/admin/pacientes', label: 'Pacientes' },
  { href: '/paciente/admin/checkins', label: 'Check-ins' },
  { href: '/paciente/admin/publicacoes', label: 'Publicações' },
  { href: '/paciente/admin/duvidas', label: 'Dúvidas (agente)' },
  { href: '/paciente/admin/indicacoes', label: 'Indicações' },
  { href: '/paciente/admin/uso', label: 'Uso do app' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: isAdmin } = await createClient().rpc('is_admin');
  if (!isAdmin) redirect('/paciente');

  return (
    <div className="mx-auto max-w-6xl gap-6 px-4 py-6 md:flex md:px-6 md:py-8">
      <aside className="vidro mb-5 rounded-[28px] p-4 md:sticky md:top-8 md:mb-0 md:w-56 md:shrink-0 md:self-start">
        <p className="text-eyebrow uppercase tracking-editorial text-terracotta">Clínica RS</p>
        <p className="mb-4 font-display text-lg">Painel</p>
        <SideNav items={ITENS} />
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm md:mt-6 md:flex-col md:items-start">
          <Link href="/paciente" className="font-medium text-terracotta-deep underline">Voltar ao app do paciente</Link>
          <form action="/paciente/sair" method="post"><button className="underline text-ash">Sair</button></form>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
