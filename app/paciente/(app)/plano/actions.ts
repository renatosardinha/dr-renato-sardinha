'use server';

import { createClient } from '@/lib/supabase/server';
import { opcoesDaClinica, buscarMesmaFuncao, trocarAlimento, type ResultadoTroca } from '@/lib/agente/trocas';

/** Item do plano do próprio paciente (a quantidade vem do banco, nunca do navegador). */
async function itemDoPaciente(itemId: string) {
  const supabase = createClient();
  const { data: pid } = await supabase.rpc('current_patient_id');
  if (!pid || !/^[0-9a-f-]{36}$/i.test(String(itemId))) return null;
  const { data } = await supabase.from('plan_items')
    .select('id, nome, alimento_id, quantidade_g').eq('id', itemId).eq('patient_id', pid).maybeSingle();
  return data && data.alimento_id && data.quantidade_g != null ? data : null;
}

export async function opcoesTroca(itemId: string) {
  const it = await itemDoPaciente(itemId);
  return it ? opcoesDaClinica(it.alimento_id) : [];
}

export async function buscarTroca(itemId: string, termo: string) {
  const it = await itemDoPaciente(itemId);
  return it ? buscarMesmaFuncao(it.alimento_id, String(termo ?? '').slice(0, 60)) : [];
}

export async function calcularTroca(itemId: string, destinoId: string): Promise<ResultadoTroca> {
  const it = await itemDoPaciente(itemId);
  if (!it) return { ok: false, erro: 'Item não encontrado.' };
  return trocarAlimento(it.alimento_id, Number(it.quantidade_g), destinoId);
}
