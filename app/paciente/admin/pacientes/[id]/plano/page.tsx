import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Avisos } from '@/components/paciente/Avisos';
import { PlanoEditor, type LinhaPlano } from '@/components/paciente/PlanoEditor';

export const dynamic = 'force-dynamic';

export default async function PlanoDoPaciente({ params, searchParams }: { params: { id: string }; searchParams: { ok?: string; erro?: string } }) {
  const supabase = createClient();
  const { data: p } = await supabase.from('patients').select('id, nome').eq('id', params.id).maybeSingle();
  if (!p) notFound();
  const { data: itens } = await supabase.from('plan_items')
    .select('refeicao, nome, alimento_id, quantidade_g, medida').eq('patient_id', p.id).order('ordem');
  const inicial: LinhaPlano[] = (itens ?? []).map((i) => ({
    refeicao: i.refeicao, nome: i.nome, alimento_id: i.alimento_id, quantidade_g: i.quantidade_g == null ? '' : String(Number(i.quantidade_g)), medida: i.medida ?? '',
  }));

  return (
    <section>
      <Link href={`/paciente/admin/pacientes/${p.id}`} className="text-sm underline text-ash">← {p.nome}</Link>
      <h1 className="mt-3 font-display text-display-sm">Plano alimentar</h1>
      <p className="mt-1 text-sm text-ash">
        Cole o plano em texto (gerado pelo projeto Planos Terapêuticos) e confira. O que você salvar aparece para o paciente na aba “Plano”, com o botão “Trocar” em cada alimento reconhecido.
      </p>
      <div className="mt-4"><Avisos ok={searchParams.ok} erro={searchParams.erro} /></div>
      <PlanoEditor pacienteId={p.id} inicial={inicial} />
    </section>
  );
}
