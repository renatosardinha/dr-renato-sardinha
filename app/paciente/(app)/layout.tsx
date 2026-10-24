import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PacienteTabs } from '@/components/paciente/NavLinks';

export const dynamic = 'force-dynamic';

const ITENS = [
  { href: '/paciente', label: 'Feed', exact: true, icone: 'feed' as const },
  { href: '/paciente/documentos', label: 'Documentos', icone: 'documentos' as const },
  { href: '/paciente/duvidas', label: 'Dúvidas', icone: 'duvidas' as const },
  { href: '/paciente/indicacoes', label: 'Indicações', icone: 'indicacoes' as const },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: pid } = await supabase.rpc('current_patient_id');
  const { data: admin } = await supabase.rpc('is_admin');

  if (!pid && !admin) {
    return (
      <main className="mx-auto max-w-prose px-6 py-24">
        <h1 className="font-display text-display-sm">Acesso não liberado</h1>
        <p className="mt-3 text-graphite">O e-mail {user?.email} não está ativo na clínica. Fale com a recepção.</p>
        <form action="/paciente/sair" method="post" className="mt-6">
          <button className="text-sm underline text-ash">Sair</button>
        </form>
      </main>
    );
  }

  let nome = '';
  if (pid) {
    const { data } = await supabase.from('patients').select('nome').eq('id', pid).maybeSingle();
    nome = data?.nome?.split(' ')[0] ?? '';
  }

  return (
    <div className="min-h-screen md:pl-20">
      <PacienteTabs items={ITENS} />
      <header className="sticky top-0 z-10 border-b border-mist bg-ivory">
        <div className="mx-auto flex h-14 max-w-[600px] items-center justify-between gap-3 px-4">
          <div className="min-w-0">
            <p className="font-display text-lg leading-none">Clínica RS</p>
            {nome && <p className="mt-1 truncate text-xs text-ash">Olá, {nome}</p>}
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {admin && <Link href="/paciente/admin" className="rounded-full border border-mist px-4 py-2 text-terracotta-deep hover:bg-sand">Painel admin</Link>}
            <form action="/paciente/sair" method="post">
              <button className="rounded-full bg-ink px-4 py-2 text-ivory">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[600px] px-4 pb-28 pt-4 md:pb-10">{children}</main>
    </div>
  );
}
