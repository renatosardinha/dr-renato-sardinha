import { FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { EnvioArquivo } from '@/components/paciente/EnvioArquivo';

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

  const { data: envios } = pid
    ? await supabase.from('patient_uploads')
        .select('id, tipo, nome_arquivo, observacao, storage_path, created_at').eq('patient_id', pid)
        .order('created_at', { ascending: false }).limit(50)
    : { data: [] as { id: string; tipo: string; nome_arquivo: string; observacao: string | null; storage_path: string; created_at: string }[] };
  const enviados = await Promise.all(
    (envios ?? []).map(async (d) => {
      const { data } = await supabase.storage.from('documentos').createSignedUrl(d.storage_path, 300);
      return { ...d, url: data?.signedUrl };
    })
  );

  return (
    <section>
      <h1 className="font-display text-2xl">Meus documentos</h1>
      {links.length === 0 ? (
        <p className="mt-4 rounded-[18px] border border-mist bg-ivory p-6 text-ash">Nenhum documento disponível ainda.</p>
      ) : (
        <ul className="mt-4 divide-y divide-mist rounded-[18px] border border-mist bg-ivory">
          {links.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3">
              <FileText strokeWidth={1.5} className="h-6 w-6 shrink-0 stroke-ink" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-ash">
                  {TIPO[d.tipo] ?? 'Documento'}{d.data_documento ? ` · ${new Date(d.data_documento + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}
                </span>
                <span className="block truncate text-[15px]">{d.titulo}</span>
              </span>
              {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full border border-terracotta-deep px-4 py-2 text-sm font-semibold text-terracotta-deep hover:bg-terracotta-deep hover:text-ivory">Abrir</a>}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 font-display text-xl">Enviar arquivo para a clínica</h2>
      {pid && <EnvioArquivo pacienteId={pid as string} />}

      {enviados.length > 0 && (
        <>
          <h3 className="mt-8 font-display text-lg">Enviados por você</h3>
          <ul className="mt-3 divide-y divide-mist rounded-[18px] border border-mist bg-ivory">
            {enviados.map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                <FileText strokeWidth={1.5} className="h-6 w-6 shrink-0 stroke-ink" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ash">
                    {TIPO[d.tipo] ?? 'Documento'} · {new Date(d.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="block truncate text-[15px]">{d.observacao || d.nome_arquivo}</span>
                </span>
                {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full border border-terracotta-deep px-4 py-2 text-sm font-semibold text-terracotta-deep hover:bg-terracotta-deep hover:text-ivory">Abrir</a>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
