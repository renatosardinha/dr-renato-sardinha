import { createClient } from '@/lib/supabase/server';
import { Avisos } from '@/components/paciente/Avisos';
import { campo, botao } from '@/components/paciente/ui';
import { vincularBioimpedancia, removerBioimpedancia } from './actions';

export const dynamic = 'force-dynamic';

type Linha = {
  id: string; patient_id: string | null; email_recebido: string | null; id_recebido: string | null; medido_em: string;
  peso: number | null; massa_muscular: number | null; massa_gordura: number | null; percentual_gordura: number | null;
  dados_brutos: unknown;
};

const COLS = 'id, patient_id, email_recebido, id_recebido, medido_em, peso, massa_muscular, massa_gordura, percentual_gordura, dados_brutos';
const quando = (iso: string) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });
const n = (v: number | null, u: string) => (v === null ? '—' : `${Number(v).toLocaleString('pt-BR')} ${u}`);

function Valores({ l }: { l: Linha }) {
  return (
    <span className="text-graphite">
      Peso {n(l.peso, 'kg')} · Músculo {n(l.massa_muscular, 'kg')} · Gordura {n(l.massa_gordura, 'kg')} · {n(l.percentual_gordura, '%')}
    </span>
  );
}

export default async function Bioimpedancia({ searchParams }: { searchParams: { ok?: string; erro?: string } }) {
  const supabase = createClient();
  const [pend, rec, pacs] = await Promise.all([
    supabase.from('bioimpedancias').select(COLS).is('patient_id', null).order('created_at', { ascending: false }).limit(100),
    supabase.from('bioimpedancias').select(COLS).not('patient_id', 'is', null).order('created_at', { ascending: false }).limit(30),
    supabase.from('patients').select('id, nome, email').eq('ativo', true).order('nome').limit(3000),
  ]);
  const pendentes = (pend.data ?? []) as Linha[];
  const recentes = (rec.data ?? []) as Linha[];
  const pacientes = (pacs.data ?? []) as { id: string; nome: string; email: string }[];
  const nome = new Map(pacientes.map((p) => [p.id, p.nome]));
  const semValores = recentes.filter((l) => l.peso === null);

  return (
    <section>
      <h1 className="font-display text-display-sm">Bioimpedância</h1>
      <p className="mt-2 text-sm text-graphite">
        Resultados enviados automaticamente pelo LookinBody. O paciente é identificado pelo e-mail cadastrado no LookinBody,
        que precisa ser igual ao e-mail de acesso ao app.
      </p>
      <div className="mt-4"><Avisos ok={searchParams.ok} erro={searchParams.erro} /></div>

      <h2 className="mt-8 font-display text-xl">Pendentes ({pendentes.length})</h2>
      <p className="mt-1 text-sm text-ash">E-mail vazio ou não encontrado. Vincule ao paciente certo; o paciente só vê depois disso.</p>
      {pendentes.length === 0 ? <p className="mt-3 text-ash">Nada pendente.</p> : (
        <ul className="mt-3 divide-y divide-mist border-y border-mist">
          {pendentes.map((l) => (
            <li key={l.id} className="space-y-2 py-4 text-sm">
              <p>
                <b>{quando(l.medido_em)}</b> · e-mail: {l.email_recebido ?? 'não informado'}{l.id_recebido ? ` · ID: ${l.id_recebido}` : ''}
              </p>
              <p><Valores l={l} /></p>
              <form action={vincularBioimpedancia} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={l.id} />
                <select name="patient_id" required className={`${campo} max-w-sm`} defaultValue="">
                  <option value="" disabled>Escolher paciente…</option>
                  {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome} ({p.email})</option>)}
                </select>
                <button className={botao}>Vincular</button>
              </form>
              <form action={removerBioimpedancia}>
                <input type="hidden" name="id" value={l.id} />
                <button className="underline text-ash">Remover</button>
              </form>
              <details>
                <summary className="cursor-pointer text-ash">Ver dados recebidos</summary>
                <pre className="mt-2 max-h-64 overflow-auto bg-ivory p-3 text-xs">{JSON.stringify(l.dados_brutos, null, 2)}</pre>
              </details>
            </li>
          ))}
        </ul>
      )}

      {semValores.length > 0 && (
        <p className="mt-6 border border-terracotta p-3 text-sm text-terracotta" role="alert">
          {semValores.length} resultado(s) chegaram sem os valores reconhecidos. Abra &quot;Ver dados recebidos&quot; e envie para quem mantém o app ajustar a leitura.
        </p>
      )}

      <h2 className="mt-10 font-display text-xl">Recebidos recentemente</h2>
      {recentes.length === 0 ? <p className="mt-3 text-ash">Nenhum resultado recebido ainda.</p> : (
        <ul className="mt-3 divide-y divide-mist border-y border-mist">
          {recentes.map((l) => (
            <li key={l.id} className="space-y-1 py-3 text-sm">
              <p><b>{nome.get(l.patient_id!) ?? 'Paciente'}</b> · {quando(l.medido_em)}</p>
              <p><Valores l={l} /></p>
              <details>
                <summary className="cursor-pointer text-ash">Ver dados recebidos</summary>
                <pre className="mt-2 max-h-64 overflow-auto bg-ivory p-3 text-xs">{JSON.stringify(l.dados_brutos, null, 2)}</pre>
              </details>
              <form action={removerBioimpedancia}>
                <input type="hidden" name="id" value={l.id} />
                <button className="underline text-ash">Remover</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
