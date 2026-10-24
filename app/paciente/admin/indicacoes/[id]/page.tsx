import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { atualizarIndicacao, removerIndicacao } from '../../actions';
import { Avisos } from '@/components/paciente/Avisos';
import { botao } from '@/components/paciente/ui';
import { CamposIndicacao } from '@/components/paciente/IndicacaoForm';

export const dynamic = 'force-dynamic';

export default async function EditarIndicacao({ params, searchParams }: { params: { id: string }; searchParams: { ok?: string; erro?: string } }) {
  const { data: i } = await createClient().from('indicacoes')
    .select('id, categoria, nome, descricao, whatsapp, instagram, site, cupom, ordem, ativo').eq('id', params.id).maybeSingle();
  if (!i) notFound();

  return (
    <section>
      <Link href="/paciente/admin/indicacoes" className="text-sm underline text-ash">← Indicações</Link>
      <h1 className="mt-3 font-display text-display-sm">Editar indicação</h1>
      <div className="mt-4"><Avisos ok={searchParams.ok} erro={searchParams.erro} /></div>
      <form action={atualizarIndicacao} className="mt-2 space-y-3">
        <input type="hidden" name="id" value={i.id} />
        <CamposIndicacao v={i} />
        <label className="flex items-center gap-2 text-sm text-graphite"><input type="checkbox" name="ativo" defaultChecked={i.ativo} /> Visível para os pacientes</label>
        <button className={botao}>Salvar</button>
      </form>
      <form action={removerIndicacao} className="mt-8"><input type="hidden" name="id" value={i.id} /><button className="text-sm underline text-ash">Remover esta indicação</button></form>
    </section>
  );
}
