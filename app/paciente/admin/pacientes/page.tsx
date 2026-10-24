import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { criarPaciente } from '../actions';
import { Avisos } from '@/components/paciente/Avisos';
import { campo, botao, rotulo } from '@/components/paciente/ui';

export const dynamic = 'force-dynamic';

export default async function Pacientes({ searchParams }: { searchParams: { q?: string; ok?: string; erro?: string } }) {
  const supabase = createClient();
  const q = (searchParams.q ?? '').trim().replace(/[%,()]/g, '');
  let query = supabase.from('patients').select('id, nome, email, celular, ativo').order('nome');
  if (q) query = query.or(`nome.ilike.%${q}%,email.ilike.%${q}%`);
  const { data: pacientes } = await query;

  return (
    <section>
      <h1 className="font-display text-display-sm">Pacientes</h1>
      <div className="mt-4"><Avisos ok={searchParams.ok} erro={searchParams.erro} /></div>

      <form className="mt-2 flex gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Buscar por nome ou e-mail" className={campo} />
        <button className={botao}>Buscar</button>
      </form>

      <p className="mt-3 text-sm"><Link href="/paciente/admin/pacientes/importar" className="underline">Importar planilha de pacientes</Link></p>

      <details className="mt-4 border border-mist bg-ivory p-4" open={!!searchParams.erro}>
        <summary className="cursor-pointer text-sm font-medium">+ Novo paciente</summary>
        <form action={criarPaciente} className="mt-4 space-y-3">
          <div><label className={rotulo}>Nome completo</label><input name="nome" required className={campo} /></div>
          <div><label className={rotulo}>E-mail (o código de acesso chega aqui)</label><input name="email" type="email" required className={campo} /></div>
          <div><label className={rotulo}>Celular (opcional)</label><input name="celular" className={campo} /></div>
          <label className="flex items-start gap-2 text-sm text-graphite">
            <input type="checkbox" name="consentimento" className="mt-1" />
            O paciente consentiu com o uso da área do paciente e o tratamento dos seus dados (LGPD).
          </label>
          <button className={botao}>Cadastrar</button>
        </form>
      </details>

      <p className="mt-6 text-sm text-ash">{(pacientes ?? []).length} paciente(s)</p>
      <ul className="mt-2 divide-y divide-mist border-y border-mist">
        {(pacientes ?? []).map((p) => (
          <li key={p.id}>
            <Link href={`/paciente/admin/pacientes/${p.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-sand/50">
              <span>
                <span className="block">{p.nome}</span>
                <span className="text-sm text-ash">{p.email}{p.celular ? ` · ${p.celular}` : ''}</span>
              </span>
              <span className="text-sm text-ash">{p.ativo ? 'Abrir →' : 'Inativo →'}</span>
            </Link>
          </li>
        ))}
        {(pacientes ?? []).length === 0 && <li className="py-4 text-ash">Nenhum paciente encontrado.</li>}
      </ul>
    </section>
  );
}
