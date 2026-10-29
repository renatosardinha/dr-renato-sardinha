import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { curva } from '@/lib/grafico';
import { Users, Activity, MessageCircle, FileText, type LucideIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

const TIPO: Record<string, string> = { bioimpedancia: 'Bioimpedância', receita: 'Receita', exame: 'Exame', outro: 'Outro' };
const GRADS = ['grad-coral', 'grad-teal', 'grad-ambar', 'grad-roxo'];

type Kpi = { nome: string; valor: number; nota: string; Icone: LucideIcon; grad: string; cor: string; serie?: number[]; href: string };

export default async function VisaoGeral() {
  const supabase = createClient();
  const desde30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const desde14 = new Date(Date.now() - 14 * 86400000).toISOString();

  const [uso, serie, perguntas, perguntas30, urgentes30, novosCount, envios, inativos, metricas, posts] = await Promise.all([
    supabase.rpc('painel_uso'),
    supabase.rpc('uso_por_dia', { p_dias: 14 }),
    supabase.from('agent_messages').select('created_at').gte('created_at', desde14).limit(3000),
    supabase.from('agent_messages').select('id', { count: 'exact', head: true }).gte('created_at', desde30),
    supabase.from('agent_messages').select('id', { count: 'exact', head: true }).gte('created_at', desde30).eq('urgente', true),
    supabase.from('patient_uploads').select('id', { count: 'exact', head: true }).is('visto_em', null),
    supabase.from('patient_uploads').select('id, patient_id, tipo, nome_arquivo, observacao, created_at, visto_em').order('created_at', { ascending: false }).limit(5),
    supabase.rpc('pacientes_inativos', { p_dias: 30 }),
    supabase.rpc('metricas_posts'),
    supabase.from('posts').select('id, titulo').eq('publicado', true),
  ]);

  const r = ((uso.data ?? [])[0] ?? {}) as { total_ativos?: number; ativos_7d?: number; ativos_30d?: number; nunca_acessaram?: number };

  // Séries dos últimos 14 dias
  const dias = (serie.data ?? []) as { dia: string; pacientes: number }[];
  const acessos = dias.map((d) => Number(d.pacientes));
  const porDia = new Map<string, number>();
  ((perguntas.data ?? []) as { created_at: string }[]).forEach((m) => {
    const k = new Date(m.created_at).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    porDia.set(k, (porDia.get(k) ?? 0) + 1);
  });
  const duvidasSerie = dias.map((d) => porDia.get(d.dia) ?? 0);

  // Nomes dos pacientes dos envios recentes
  const lista = (envios.data ?? []) as { id: string; patient_id: string; tipo: string; nome_arquivo: string; observacao: string | null; created_at: string; visto_em: string | null }[];
  const ids = Array.from(new Set(lista.map((e) => e.patient_id)));
  const { data: nomes } = ids.length ? await supabase.from('patients').select('id, nome').in('id', ids) : { data: [] as { id: string; nome: string }[] };
  const nomePor = new Map((nomes ?? []).map((n) => [n.id, n.nome as string]));

  // Posts mais abertos
  const titulos = new Map((posts.data ?? []).map((p) => [p.id, p.titulo as string]));
  const top = ((metricas.data ?? []) as { post_id: string; curtidas: number; pacientes: number }[])
    .filter((m) => titulos.has(m.post_id))
    .sort((a, b) => Number(b.pacientes) - Number(a.pacientes) || Number(b.curtidas) - Number(a.curtidas)).slice(0, 4);
  const maxTop = Math.max(1, ...top.map((t) => Number(t.pacientes)));

  const nInativos = ((inativos.data ?? []) as unknown[]).length;
  const novos = novosCount.count ?? 0;
  const urg = urgentes30.count ?? 0;

  const kpis: Kpi[] = [
    { nome: 'Pacientes ativos', valor: r.total_ativos ?? 0, nota: `${r.nunca_acessaram ?? 0} ainda não acessaram`, Icone: Users, grad: 'grad-coral', cor: '#C4431F', href: '/paciente/admin/pacientes' },
    { nome: 'Acessaram em 7 dias', valor: r.ativos_7d ?? 0, nota: `${r.ativos_30d ?? 0} em 30 dias`, Icone: Activity, grad: 'grad-teal', cor: '#157A74', serie: acessos, href: '/paciente/admin/uso' },
    { nome: 'Perguntas ao assistente', valor: perguntas30.count ?? 0, nota: urg ? `${urg} com alerta (30 dias)` : 'últimos 30 dias', Icone: MessageCircle, grad: 'grad-ambar', cor: '#B8730A', serie: duvidasSerie, href: '/paciente/admin/duvidas' },
    { nome: 'Arquivos novos', valor: novos, nota: novos ? 'aguardando abertura' : 'nenhum pendente', Icone: FileText, grad: 'grad-roxo', cor: '#6B3FA0', href: '/paciente/admin/pacientes' },
  ];

  const W = 600, H = 230;
  const maxGraf = Math.max(1, ...acessos, ...duvidasSerie);
  const a = curva(acessos, W, H, 24, maxGraf);
  const p = curva(duvidasSerie, W, H, 24, maxGraf);
  const ult = a.pts[a.pts.length - 1];

  const alertas: { t: string; d: string; cor: string; href: string }[] = [];
  if (urg) alertas.push({ t: `${urg} pergunta(s) com alerta de urgência`, d: 'O assistente respondeu com orientação fixa. Vale revisar.', cor: '#C4431F', href: '/paciente/admin/duvidas' });
  if (nInativos) alertas.push({ t: `${nInativos} paciente(s) sem acesso há 30 dias`, d: 'Podem precisar de um lembrete.', cor: '#B8730A', href: '/paciente/admin/uso' });
  if (r.nunca_acessaram) alertas.push({ t: `${r.nunca_acessaram} paciente(s) nunca acessaram`, d: 'Cadastro feito, mas sem primeiro acesso.', cor: '#6B3FA0', href: '/paciente/admin/uso' });

  const card = 'vidro rounded-[28px] p-5';
  return (
    <section>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Painel</h1>
          <p className="mt-1 text-sm text-ash">Resumo da clínica no app. Dados reais.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action="/paciente/admin/pacientes" role="search" className="vidro flex items-center rounded-full pl-4">
            <input name="q" placeholder="Buscar paciente" aria-label="Buscar paciente" className="w-36 bg-transparent py-3 text-sm outline-none" />
            <button className="aba-ativa m-1 min-h-[40px] rounded-full px-4 text-sm font-medium">Buscar</button>
          </form>
          <Link href="/paciente/admin/publicacoes" className="cartao-vidro min-h-[46px] rounded-full px-5 py-3 text-sm font-medium text-terracotta-deep">Nova publicação</Link>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const s = k.serie && k.serie.length > 1 ? curva(k.serie, 110, 40, 4, Math.max(1, ...k.serie)).d : null;
          return (
            <Link key={k.nome} href={k.href} className={`${card} block`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ash">{k.nome}</span>
                <span className={`${k.grad} flex h-9 w-9 items-center justify-center rounded-[12px]`} aria-hidden>
                  <k.Icone strokeWidth={2} className="h-[18px] w-[18px] stroke-white" />
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <p className="font-display text-4xl leading-none tracking-tight">{k.valor}</p>
                  <p className="mt-2 text-xs font-medium" style={{ color: k.cor }}>{k.nota}</p>
                </div>
                {s && (
                  <svg aria-hidden="true" width="110" height="40" viewBox="0 0 110 40" fill="none">
                    <path d={s} stroke={k.cor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className={`${card} lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Atividade (14 dias)</h2>
            <Link href="/paciente/admin/uso" className="text-sm font-medium text-terracotta-deep">Ver detalhes</Link>
          </div>
          <svg role="img" aria-label="Pacientes que acessaram e perguntas ao assistente por dia, nos últimos 14 dias" viewBox={`0 0 ${W} ${H}`} className="mt-3 block h-auto w-full">
            <defs>
              <linearGradient id="areaAcessos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E0693F" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#E0693F" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={`M0 ${H * 0.22}H${W}M0 ${H * 0.5}H${W}M0 ${H * 0.78}H${W}`} stroke="rgba(30,43,42,0.10)" strokeWidth="1" strokeDasharray="4 6" />
            {a.d && <path d={`${a.d} L${W} ${H} L0 ${H} Z`} fill="url(#areaAcessos)" />}
            {a.d && <path d={a.d} fill="none" stroke="#C4431F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
            {p.d && <path d={p.d} fill="none" stroke="#157A74" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 7" />}
            {ult && <circle cx={ult[0]} cy={ult[1]} r="6" fill="#FFFFFF" stroke="#C4431F" strokeWidth="3" />}
          </svg>
          <div className="mt-2 flex gap-5 text-xs text-ash">
            <span className="flex items-center gap-1.5"><span className="h-1 w-3.5 rounded bg-[#C4431F]" />Pacientes que acessaram</span>
            <span className="flex items-center gap-1.5"><span className="h-1 w-3.5 rounded bg-[#157A74]" />Perguntas ao assistente</span>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-display text-xl">Precisa de atenção</h2>
          <div className="mt-3 space-y-2.5">
            {alertas.length === 0 && <p className="text-sm text-ash">Nada pendente.</p>}
            {alertas.map((al) => (
              <Link key={al.t} href={al.href} className="cartao-vidro flex gap-3 rounded-[18px] p-3">
                <span className="w-2 shrink-0 rounded" style={{ background: al.cor }} />
                <span>
                  <span className="block text-sm font-medium">{al.t}</span>
                  <span className="block text-xs text-ash">{al.d}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Arquivos enviados</h2>
            {novos > 0 && <span className="rounded-full bg-[#C4431F] px-2.5 py-1 text-xs font-medium text-white">{novos} {novos === 1 ? 'novo' : 'novos'}</span>}
          </div>
          <ul className="mt-3 space-y-2">
            {lista.length === 0 && <li className="text-sm text-ash">Nenhum arquivo enviado ainda.</li>}
            {lista.map((e, i) => {
              const nome = nomePor.get(e.patient_id) ?? 'Paciente';
              return (
                <li key={e.id}>
                  <Link href={`/paciente/admin/pacientes/${e.patient_id}`} className="cartao-vidro flex min-h-[52px] items-center gap-3 rounded-[18px] px-3 py-2">
                    <span className={`${GRADS[i % GRADS.length]} flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white`} aria-hidden>
                      {nome.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{nome}</span>
                      <span className="block truncate text-xs text-ash">{TIPO[e.tipo] ?? 'Outro'} · {new Date(e.created_at).toLocaleDateString('pt-BR')}</span>
                    </span>
                    {!e.visto_em && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#C4431F] shadow-[0_0_0_4px_rgba(196,67,31,0.18)]" aria-label="novo" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={card}>
          <h2 className="font-display text-xl">Publicações mais abertas</h2>
          <div className="mt-4 space-y-4">
            {top.length === 0 && <p className="text-sm text-ash">Ainda sem dados.</p>}
            {top.map((m, i) => (
              <div key={m.post_id}>
                <div className="flex justify-between gap-3 text-sm">
                  <Link href={`/paciente/admin/publicacoes/${m.post_id}`} className="font-medium hover:underline">{titulos.get(m.post_id)}</Link>
                  <span className="shrink-0 text-ash">{Number(m.pacientes)} abriram · ♥ {Number(m.curtidas)}</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/60">
                  <div className={`${GRADS[i % GRADS.length]} h-2.5 rounded-full`} style={{ width: `${Math.round((Number(m.pacientes) / maxTop) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-ash">
        Para enviar uma bioimpedância, abra o paciente em <b>Pacientes</b> e use “Enviar documento”.
      </p>
    </section>
  );
}
