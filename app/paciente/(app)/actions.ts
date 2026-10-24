'use server';

import { createClient } from '@/lib/supabase/server';

/** Curte ou descurte um post (só pacientes ativos; cada um altera apenas a própria curtida). */
export async function alternarCurtida(postId: string): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const { data: pid } = await supabase.rpc('current_patient_id');
  if (!pid || !postId) return { ok: false };

  const { data: existe } = await supabase.from('post_likes').select('post_id')
    .eq('post_id', postId).eq('patient_id', pid).maybeSingle();

  const { error } = existe
    ? await supabase.from('post_likes').delete().eq('post_id', postId).eq('patient_id', pid)
    : await supabase.from('post_likes').insert({ post_id: postId, patient_id: pid });
  return { ok: !error };
}
