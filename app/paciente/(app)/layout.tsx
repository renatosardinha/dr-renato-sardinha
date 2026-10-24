import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PacienteTabs } from '@/components/paciente/NavLinks';

export const dynamic = 'force-dynamic';

const ITENS = [
  { href: '/paciente', label: 'Feed', exact: true },
  { href: '/paciente/documentos', label: 'Meus documentos' },
  { href: '/paciente/duvidas', label: 'Dúvidas' },
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
    <div className="pb-20 md:pb-0">
      <header className="border-b border-mist bg-ivory">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-3">
          <div>
            <p className="text-eyebrow uppercase tracking-editorial text-terracotta">Clínica RS</p>
            {nome && <p className="text-sm text-graphite">Olá, {nome}</p>}
          </div>
          <PacienteTabs items={ITENS} />
          <div className="flex items-center gap-3 text-sm">
            {admin && <Link href="/paciente/admin" className="underline text-terracotta">Painel admin</Link>}
            <form action="/paciente/sair" method="post"><button className="underline text-ash">Sair</button></form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-6 py-10">{children}</div>
    </div>
  );
}
