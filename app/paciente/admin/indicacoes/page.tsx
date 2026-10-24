import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { criarIndicacao } from '../actions';
import { Avisos } from '@/components/paciente/Avisos';
import { botao } from '@/components/paciente/ui';
import { CamposIndicacao, CATEGORIAS_ROTULO } from '@/components/paciente/IndicacaoForm';

export const dynamic = 'force-dynamic';

export default async function Indicacoes({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.from('indicacoes').select('id, categoria, nome, descricao, ativo, ordem')
    .order('categoria').order('ordem').order('nome');

  return (
    <section>
      <h1 className="font-display text-display-sm">Indicações</h1>
      <div className="mt-4"><Avisos ok={searchParams.ok} erro={searchParams.erro} /></div>
      {error && <p className="mb-4 text-sm text-terracotta">Rode a migração 0006 no Supabase para ativar esta página.</p>}

      <details className="border border-mist bg-ivory p-4" open={!!searchParams.erro}>
        <summary className="cursor-pointer text-sm font-medium">+ Nova indicação</summary>
        <form action={criarIndicacao} className="mt-4 space-y-3"><CamposIndicacao /><button className={botao}>Adicionar</button></form>
      </details>

      <ul className="mt-6 divide-y divide-mist border-y border-mist">
        {(data ?? []).map((i) => (
          <li key={i.id}>
            <Link href={`/paciente/admin/indicacoes/${i.id}`} className="flex items-center justify-between gap-4 py-3 text-sm hover:bg-sand/50">
              <span>
                <span className="block">{i.nome}</span>
                <span className="text-ash">{CATEGORIAS_ROTULO[i.categoria] ?? i.categoria}{!i.ativo ? ' · oculto' : ''}</span>
              </span>
              <span className="text-ash">Editar →</span>
            </Link>
          </li>
        ))}
        {!error && (data ?? []).length === 0 && <li className="py-4 text-ash">Nenhuma indicação ainda.</li>}
      </ul>
    </section>
  );
}
