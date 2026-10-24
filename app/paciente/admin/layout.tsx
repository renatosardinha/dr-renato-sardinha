import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SideNav } from '@/components/paciente/NavLinks';

export const dynamic = 'force-dynamic';

const ITENS = [
  { href: '/paciente/admin', label: 'Visão geral', exact: true },
  { href: '/paciente/admin/pacientes', label: 'Pacientes' },
  { href: '/paciente/admin/publicacoes', label: 'Publicações' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: isAdmin } = await createClient().rpc('is_admin');
  if (!isAdmin) redirect('/paciente');

  return (
    <div className="mx-auto max-w-5xl gap-8 px-6 py-8 md:flex">
      <aside className="mb-6 md:mb-0 md:w-52 md:shrink-0">
        <p className="text-eyebrow uppercase tracking-editorial text-terracotta">Clínica RS</p>
        <p className="mb-4 font-display text-lg">Painel</p>
        <SideNav items={ITENS} />
        <div className="mt-6 hidden flex-col gap-2 text-sm md:flex">
          <Link href="/paciente" className="underline text-ash">Ver como paciente</Link>
          <form action="/paciente/sair" method="post"><button className="underline text-ash">Sair</button></form>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
