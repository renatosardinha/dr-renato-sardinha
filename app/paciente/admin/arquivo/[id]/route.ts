import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Abre um arquivo enviado pelo paciente e marca como visto (some o selo "novo"). Só para a clínica. */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: admin } = await supabase.rpc('is_admin');
  if (!admin) return NextResponse.redirect(new URL('/paciente', req.url));

  const { data: envio } = await supabase.from('patient_uploads')
    .select('id, patient_id, storage_path, visto_em').eq('id', params.id).maybeSingle();
  if (!envio) return NextResponse.redirect(new URL('/paciente/admin/pacientes', req.url));

  if (!envio.visto_em) {
    await supabase.from('patient_uploads').update({ visto_em: new Date().toISOString() }).eq('id', envio.id);
  }
  const { data } = await supabase.storage.from('documentos').createSignedUrl(envio.storage_path, 300);
  if (!data?.signedUrl) {
    return NextResponse.redirect(new URL(`/paciente/admin/pacientes/${envio.patient_id}?erro=${encodeURIComponent('Não consegui abrir o arquivo.')}`, req.url));
  }
  return NextResponse.redirect(data.signedUrl);
}
