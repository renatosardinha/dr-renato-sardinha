'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { buscarAlimento, alimentoPorId } from '@/lib/agente/trocas';

async function exigirAdmin() {
  const supabase = createClient();
  const { data } = await supabase.rpc('is_admin');
  if (!data) redirect('/paciente');
  return supabase;
}

/** Busca de alimentos para o editor do plano (só administrador). */
export async function buscarAlimentoPlano(termo: string) {
  await exigirAdmin();
  const r = buscarAlimento(String(termo ?? '').slice(0, 60));
  if (!r.ok || !r.opcoes) return [];
  return r.opcoes.map((o) => ({ id: o.id, nome: o.nome, kcal: o.por_100_g.kcal, fonte: o.fonte.startsWith('padrão') ? 'clínica' : 'TACO' }));
}

type ItemEntrada = { refeicao?: unknown; nome?: unknown; alimento_id?: unknown; quantidade_g?: unknown };

export async function salvarPlano(formData: FormData) {
  const supabase = await exigirAdmin();
  const pid = String(formData.get('patient_id') ?? '');
  const base = `/paciente/admin/pacientes/${pid}/plano`;
  const erro = (m: string): never => redirect(`${base}?erro=${encodeURIComponent(m)}`);
  if (!/^[0-9a-f-]{36}$/i.test(pid)) redirect('/paciente/admin/pacientes');

  let entrada: ItemEntrada[];
  try { entrada = JSON.parse(String(formData.get('itens') ?? '[]')); } catch { return erro('Não consegui ler o plano. Tente de novo.'); }
  if (!Array.isArray(entrada) || entrada.length > 80) return erro('O plano pode ter até 80 itens.');

  const novos: { patient_id: string; refeicao: string; ordem: number; nome: string; alimento_id: string | null; quantidade_g: number | null }[] = [];
  for (const [i, e] of entrada.entries()) {
    const refeicao = String(e.refeicao ?? '').trim().slice(0, 40);
    let nome = String(e.nome ?? '').trim().slice(0, 120);
    const alimento_id = e.alimento_id ? String(e.alimento_id) : null;
    const q = e.quantidade_g === '' || e.quantidade_g == null ? null : Number(e.quantidade_g);
    if (!refeicao && !nome && !alimento_id) continue; // linha vazia
    if (!refeicao) return erro(`Linha ${i + 1}: informe a refeição.`);
    if (alimento_id) {
      const a = alimentoPorId(alimento_id);
      if (!a) return erro(`Linha ${i + 1}: alimento não reconhecido.`);
      nome = nome || a.nome;
      if (q == null) return erro(`Linha ${i + 1}: informe os gramas de ${a.nome}.`);
    }
    if (!nome) return erro(`Linha ${i + 1}: informe o alimento.`);
    if (q != null && (!Number.isFinite(q) || q <= 0 || q > 5000)) return erro(`Linha ${i + 1}: gramas inválidos.`);
    novos.push({ patient_id: pid, refeicao, ordem: novos.length, nome, alimento_id, quantidade_g: q });
  }

  // Insere o plano novo primeiro e só então apaga o antigo: se algo falhar, o plano antigo continua.
  const { data: antigos } = await supabase.from('plan_items').select('id').eq('patient_id', pid);
  if (novos.length) {
    const { error } = await supabase.from('plan_items').insert(novos);
    if (error) return erro('Não consegui salvar o plano. Tente de novo.');
  }
  const ids = (antigos ?? []).map((a) => a.id as string);
  if (ids.length) await supabase.from('plan_items').delete().in('id', ids);

  redirect(`${base}?ok=${encodeURIComponent(novos.length ? 'Plano salvo.' : 'Plano removido.')}`);
}
