'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ITENS, segundaDaSemana } from '@/lib/checkin';

const BASE = '/paciente/checkin';

export async function salvarCheckin(formData: FormData) {
  const supabase = createClient();
  const { data: pid } = await supabase.rpc('current_patient_id');
  if (!pid) redirect('/paciente');

  const valores: Record<string, number> = {};
  for (const i of ITENS) {
    const v = Number(formData.get(i.chave));
    if (formData.get(i.chave) === null || !Number.isInteger(v) || v < 0 || v > i.max) {
      redirect(`${BASE}?editar=1&erro=${encodeURIComponent('Responda todos os itens.')}`);
    }
    valores[i.chave] = v;
  }
  const observacao = String(formData.get('observacao') ?? '').trim().slice(0, 300) || null;

  const { error } = await supabase.from('checkins').upsert(
    { patient_id: pid, semana: segundaDaSemana(), ...valores, observacao },
    { onConflict: 'patient_id,semana' },
  );
  if (error) redirect(`${BASE}?editar=1&erro=${encodeURIComponent('Não consegui salvar agora. Tente de novo.')}`);
  redirect(BASE);
}

export async function definirRanking(formData: FormData) {
  const supabase = createClient();
  await supabase.rpc('definir_ranking', { p_participa: formData.get('participa') === '1' });
  redirect(BASE);
}
