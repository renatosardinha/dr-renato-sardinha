import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const digitos = (s: string | null) => {
  const d = (s ?? '').replace(/\D/g, '');
  return d ? (d.length <= 11 ? '55' + d : d) : null;
};

export default async function Uso() {
  const supabase = createClient();
  const [{ data: resumo, error }, { data: serie }, { data: inativos }, { data: metricas }, { data: posts }] = await Promise.all([
    supabase.rpc('painel_uso'),
    supabase.rpc('uso_por_dia', { p_dias: 14 }),
    supabase.rpc('pacientes_inativos', { p_dias: 30 }),
    supabase.rpc('metricas_posts'),
    supabase.from('posts').select('id, titulo').eq('publicado', true),
  ]);

  if (error) {
    return (
      <section>
        <h1 className="font-display text-display-sm">Uso do app</h1>
        <p className="mt-4 text-sm text-terracotta">Rode a migração 0007 no Supabase para ativar esta página.</p>
      </section>
    );
  }

  const r = (resumo ?? [])[0] as { total_ativos: number; ativos_7d: number; ativos_30d: number; nunca_acessaram: number } | undefined;
  const dias = (serie ?? []) as { dia: string; pacientes: number }[];
  const maximo = Math.max(1, ...dias.map((d) => Number(d.pacientes)));
  const titulos = new Map((posts ?? []).map((p) => [p.id, p.titulo as string]));
  const top = ((metricas ?? []) as { post_id: string; curtidas: number; pacientes: number }[])
    .filter((m) => titulos.has(m.post_id))
    .sort((a, b) => Number(b.pacientes) - Number(a.pacientes) || Number(b.curtidas) - Number(a.curtidas)).slice(0, 5);
  const lista = (inativos ?? []) as { id: string; nome: string; celular: string | null; ultimo_acesso: string | null }[];

  const cards = [
    { n: r?.total_ativos ?? 0, t: 'pacientes ativos' },
    { n: r?.ativos_7d ?? 0, t: 'acessaram nos últimos 7 dias' },
    { n: r?.ativos_30d ?? 0, t: 'acessaram nos últimos 30 dias' },
    { n: r?.nunca_acessaram ?? 0, t: 'ainda nunca acessaram' },
  ];

  return (
    <section>
      <h1 className="font-display text-display-sm">Uso do app</h1>
      <p className="mt-2 text-sm text-graphite">
        Conta 1 acesso por paciente por dia, a partir da ativação desta página. Não registra o que cada pessoa viu.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.t} className="rounded-lg border border-mist bg-ivory p-4">
            <p className="font-display text-3xl">{c.n}</p>
            <p className="mt-1 text-sm text-graphite">{c.t}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-display text-xl">Acessos por dia (14 dias)</h2>
      <div className="mt-3 flex h-32 items-end gap-1 rounded-lg border border-mist bg-ivory p-3" role="img" aria-label="Pacientes que acessaram por dia">
        {dias.map((d) => (
          <div key={d.dia} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${new Date(d.dia + 'T12:00:00').toLocaleDateString('pt-BR')}: ${d.pacientes}`}>
            <span className="text-[10px] text-ash">{Number(d.pacientes) || ''}</span>
            <div className="w-full rounded-t bg-terracotta-deep" style={{ height: `${Math.max(2, (Number(d.pacientes) / maximo) * 80)}px` }} />
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-display text-xl">Posts mais abertos</h2>
      <ul className="mt-2 divide-y divide-mist border-y border-mist text-sm">
        {top.map((m) => (
          <li key={m.post_id} className="flex justify-between gap-3 py-2">
            <Link href={`/paciente/admin/publicacoes/${m.post_id}`} className="hover:underline">{titulos.get(m.post_id)}</Link>
            <span className="shrink-0 text-ash">{Number(m.pacientes)} abriram · ♥ {Number(m.curtidas)}</span>
          </li>
        ))}
        {top.length === 0 && <li className="py-3 text-ash">Ainda sem dados.</li>}
      </ul>

      <h2 className="mt-8 font-display text-xl">Sem acesso há mais de 30 dias</h2>
      <p className="mt-1 text-sm text-ash">O botão abre o WhatsApp com uma mensagem pronta; você decide se envia.</p>
      <ul className="mt-2 divide-y divide-mist border-y border-mist text-sm">
        {lista.map((p) => {
          const tel = digitos(p.celular);
          const msg = `Olá, ${p.nome.split(' ')[0]}! Aqui é da Clínica RS. Você já conseguiu acessar o nosso aplicativo? Se precisar de ajuda para entrar, é só me avisar.`;
          return (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2">
              <Link href={`/paciente/admin/pacientes/${p.id}`} className="min-w-0 hover:underline">
                <span className="block truncate">{p.nome}</span>
                <span className="text-ash">{p.ultimo_acesso ? `último acesso ${new Date(p.ultimo_acesso + 'T12:00:00').toLocaleDateString('pt-BR')}` : 'nunca acessou'}</span>
              </Link>
              {tel && <a href={`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"
                className="shrink-0 rounded-full border border-mist px-4 py-2 font-semibold hover:bg-sand">WhatsApp</a>}
            </li>
          );
        })}
        {lista.length === 0 && <li className="py-3 text-ash">Nenhum paciente nessa situação.</li>}
      </ul>
      {lista.length === 200 && <p className="mt-2 text-xs text-ash">Mostrando os 200 primeiros.</p>}
    </section>
  );
}
