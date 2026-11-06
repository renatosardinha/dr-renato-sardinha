'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const BASE = '/paciente/admin/bioimpedancia';
const voltar = (tipo: 'ok' | 'erro', msg: string): never => redirect(`${BASE}?${tipo}=${encodeURIComponent(msg)}`);

async function exigirAdmin() {
  const supabase = createClient();
  const { data } = await supabase.rpc('is_admin');
  if (!data) redirect('/paciente');
  return supabase;
}

/** Vincula um resultado pendente (e-mail não encontrado) ao paciente certo. */
export async function vincularBioimpedancia(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = String(formData.get('id') ?? '');
  const patient_id = String(formData.get('patient_id') ?? '');
  if (!id || !patient_id) voltar('erro', 'Escolha o paciente.');
  const { data: linha } = await supabase.from('bioimpedancias').select('id_recebido').eq('id', id).maybeSingle();
  const { error } = await supabase.from('bioimpedancias').update({ patient_id }).eq('id', id).is('patient_id', null);
  if (error) voltar('erro', error.message);
  // Os outros pendentes com o mesmo ID do LookinBody são do mesmo paciente. Os próximos exames já entram direto.
  const idLook = (linha as { id_recebido: string | null } | null)?.id_recebido;
  if (idLook) {
    await supabase.from('bioimpedancias').update({ patient_id }).eq('id_recebido', idLook).is('patient_id', null);
  }
  voltar('ok', 'Resultado vinculado ao paciente. Os próximos exames com o mesmo ID do LookinBody entram direto.');
}

export async function removerBioimpedancia(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = String(formData.get('id') ?? '');
  const { error } = await supabase.from('bioimpedancias').delete().eq('id', id);
  if (error) voltar('erro', error.message);
  voltar('ok', 'Resultado removido.');
}
