import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PacienteTabs } from '@/components/paciente/NavLinks';

export const dynamic = 'force-dynamic';

const ITENS = [
  { href: '/paciente', label: 'Feed', exact: true, icone: 'feed' as const },
  { href: '/paciente/plano', label: 'Plano', icone: 'plano' as const },
  { href: '/paciente/checkin', label: 'Check-in', icone: 'checkin' as const },
  { href: '/paciente/documentos', label: 'Documentos', icone: 'documentos' as const },
  { href: '/paciente/duvidas', label: 'Dúvidas', icone: 'duvidas' as const },
  { href: '/paciente/indicacoes', label: 'Indicações', icone: 'indicacoes' as const },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  // As consultas são independentes: rodam juntas, em vez de uma esperando a outra.
  // registrar_acesso não faz nada para quem não é paciente (e conta no máximo 1 acesso por dia).
  const [{ data: { user } }, { data: pid }, { data: admin }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc('current_patient_id'),
    supabase.rpc('is_admin'),
    supabase.rpc('registrar_acesso'),
  ]);

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
      <header className="vidro sticky top-0 z-10 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex h-14 max-w-[600px] items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grad-coral flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] font-display text-sm font-semibold text-white shadow-[0_4px_12px_rgba(196,67,31,0.35)]" aria-hidden>RS</span>
            <div className="min-w-0">
              <p className="font-display text-lg leading-none">Clínica RS</p>
              {nome && <p className="mt-1 truncate text-xs text-ash">Olá, {nome}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {admin && <Link href="/paciente/admin" className="cartao-vidro rounded-full px-4 py-2 text-terracotta-deep hover:bg-sand">Painel admin</Link>}
            <form action="/paciente/sair" method="post">
              <button className="rounded-full bg-ink px-4 py-2 text-ivory">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <PacienteTabs items={ITENS} />
      <main className="mx-auto max-w-[600px] px-4 pb-10 pt-4">{children}</main>
    </div>
  );
}
