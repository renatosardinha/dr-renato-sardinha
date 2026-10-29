import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { atualizarPaciente, enviarDocumento, removerDocumento, removerEnvio } from '../../actions';
import { Avisos } from '@/components/paciente/Avisos';
import { campo, botao, rotulo } from '@/components/paciente/ui';

export const dynamic = 'force-dynamic';

const TIPO: Record<string, string> = { bioimpedancia: 'Bioimpedância', receita: 'Receita', exame: 'Exame', outro: 'Outro' };

export default async function PacienteDetalhe({ params, searchParams }: {
  params: { id: string }; searchParams: { ok?: string; erro?: string };
}) {
  const supabase = createClient();
  const { data: p } = await supabase.from('patients')
    .select('id, nome, email, celular, ativo, consentimento_em').eq('id', params.id).maybeSingle();
  if (!p) notFound();

  const { data: docs } = await supabase.from('documents')
    .select('id, tipo, titulo, storage_path, data_documento').eq('patient_id', p.id)
    .order('created_at', { ascending: false });
  const links = await Promise.all((docs ?? []).map(async (d) => {
    const { data } = await supabase.storage.from('documentos').createSignedUrl(d.storage_path, 300);
    return { ...d, url: data?.signedUrl };
  }));
  const { data: envios } = await supabase.from('patient_uploads')
    .select('id, tipo, nome_arquivo, observacao, visto_em, created_at').eq('patient_id', p.id)
    .order('created_at', { ascending: false }).limit(100);
  const retorno = `/paciente/admin/pacientes/${p.id}`;

  return (
    <section>
      <Link href="/paciente/admin/pacientes" className="text-sm underline text-ash">← Pacientes</Link>
      <h1 className="mt-3 font-display text-display-sm">{p.nome}</h1>
      <p className="text-sm text-ash">
        {p.consentimento_em
          ? `Consentimento LGPD registrado em ${new Date(p.consentimento_em).toLocaleDateString('pt-BR')}`
          : 'Consentimento LGPD ainda não registrado'}
      </p>
      <div className="mt-4"><Avisos ok={searchParams.ok} erro={searchParams.erro} /></div>

      <h2 className="mt-6 font-display text-xl">Dados</h2>
      <form action={atualizarPaciente} className="mt-3 space-y-3">
        <input type="hidden" name="id" value={p.id} />
        <div><label className={rotulo}>Nome completo</label><input name="nome" defaultValue={p.nome} required className={campo} /></div>
        <div>
          <label className={rotulo}>E-mail de acesso</label>
          <input name="email" type="email" defaultValue={p.email} required className={campo} />
          <p className="mt-1 text-xs text-ash">Se mudar o e-mail, o paciente passa a entrar com o novo endereço.</p>
        </div>
        <div><label className={rotulo}>Celular</label><input name="celular" defaultValue={p.celular ?? ''} className={campo} /></div>
        <label className="flex items-center gap-2 text-sm text-graphite">
          <input type="checkbox" name="ativo" defaultChecked={p.ativo} /> Acesso ativo (desmarque para bloquear a entrada)
        </label>
        <button className={botao}>Salvar</button>
      </form>

      <h2 className="mt-12 font-display text-xl">Enviados pelo paciente</h2>
      {(envios ?? []).length === 0 ? <p className="mt-3 text-ash">Nada enviado pelo paciente.</p> : (
        <ul className="mt-3 divide-y divide-mist border-y border-mist">
          {(envios ?? []).map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span>
                <span className="text-ash">
                  {TIPO[e.tipo] ?? 'Outro'} · {new Date(e.created_at).toLocaleDateString('pt-BR')}
                  {!e.visto_em && <span className="ml-2 rounded-full bg-terracotta-deep px-2 py-0.5 text-xs font-semibold text-ivory">novo</span>}
                </span><br />
                {e.observacao || e.nome_arquivo}
              </span>
              <span className="flex items-center gap-4">
                <a href={`/paciente/admin/arquivo/${e.id}`} target="_blank" rel="noopener noreferrer" className="underline text-terracotta">Abrir</a>
                <form action={removerEnvio}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="retorno" value={retorno} />
                  <button className="underline text-ash">Remover</button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-12 font-display text-xl">Documentos</h2>
      {links.length === 0 ? <p className="mt-3 text-ash">Nenhum documento enviado.</p> : (
        <ul className="mt-3 divide-y divide-mist border-y border-mist">
          {links.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span><span className="text-ash">{TIPO[d.tipo] ?? 'Outro'}</span><br />{d.titulo}</span>
              <span className="flex items-center gap-4">
                {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="underline text-terracotta">Abrir</a>}
                <form action={removerDocumento}>
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="retorno" value={retorno} />
                  <button className="underline text-ash">Remover</button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-8 font-display text-lg">Enviar documento</h3>
      <form action={enviarDocumento} className="mt-3 space-y-3">
        <input type="hidden" name="patient_id" value={p.id} />
        <input type="hidden" name="retorno" value={retorno} />
        <div>
          <label className={rotulo}>Tipo</label>
          <select name="tipo" className={campo}>
            <option value="bioimpedancia">Bioimpedância</option>
            <option value="receita">Receita</option>
            <option value="exame">Exame</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div><label className={rotulo}>Título (ex.: Bioimpedância, out/2026)</label><input name="titulo" required className={campo} /></div>
        <div><label className={rotulo}>Data do documento (opcional)</label><input name="data_documento" type="date" className={campo} /></div>
        <div><label className={rotulo}>Arquivo (PDF, JPG ou PNG, até 4 MB)</label>
          <input name="arquivo" type="file" accept="application/pdf,image/jpeg,image/png" required className="text-sm" /></div>
        <button className={botao}>Enviar</button>
      </form>
    </section>
  );
}
