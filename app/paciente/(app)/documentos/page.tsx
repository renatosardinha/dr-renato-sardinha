import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const TIPO: Record<string, string> = {
  bioimpedancia: 'Bioimpedância', receita: 'Receita', exame: 'Exame', outro: 'Documento',
};

export default async function MeusDocumentos() {
  const supabase = createClient();
  // Sempre filtra pelo próprio paciente — inclusive se quem entrou também for administrador.
  const { data: pid } = await supabase.rpc('current_patient_id');

  const { data: docs } = pid
    ? await supabase.from('documents')
        .select('id, tipo, titulo, storage_path, data_documento').eq('patient_id', pid)
        .order('created_at', { ascending: false })
    : { data: [] as { id: string; tipo: string; titulo: string; storage_path: string; data_documento: string | null }[] };

  const links = await Promise.all(
    (docs ?? []).map(async (d) => {
      const { data } = await supabase.storage.from('documentos').createSignedUrl(d.storage_path, 300);
      return { ...d, url: data?.signedUrl };
    })
  );

  return (
    <section>
      <h1 className="font-display text-display-sm">Meus documentos</h1>
      {links.length === 0 ? (
        <p className="mt-4 text-ash">Nenhum documento disponível ainda.</p>
      ) : (
        <ul className="mt-6 divide-y divide-mist border-y border-mist">
          {links.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-3">
              <span>
                <span className="text-sm text-ash">
                  {TIPO[d.tipo] ?? 'Documento'}{d.data_documento ? ` · ${new Date(d.data_documento + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}
                </span><br />
                {d.titulo}
              </span>
              {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm underline text-terracotta">Abrir</a>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
