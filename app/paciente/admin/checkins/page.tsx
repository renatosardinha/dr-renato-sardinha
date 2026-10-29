import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  alertasCheckin, diasAtras, limitesDoMes, mesAtual, deslocarMes, nomeDoMes, whatsappDoPaciente,
  type LinhaCheckin,
} from '@/lib/checkin';

export const dynamic = 'force-dynamic';

type Pac = { id: string; nome: string; celular: string | null; ranking_participa: boolean };
const TITULO: Record<string, string> = { aerobico: 'Aeróbico', forca: 'Treino de força' };

export default async function Checkins({ searchParams }: { searchParams: { mes?: string } }) {
  const supabase = createClient();
  const mes = /^\d{4}-(0[1-9]|1[0-2])$/.test(searchParams.mes ?? '') ? searchParams.mes! : mesAtual();
  const { inicio, fim } = limitesDoMes(mes);

  const [recentes, doMes, pacs] = await Promise.all([
    supabase.from('checkins')
      .select('patient_id, semana, humor, sono, energia, saciedade, plano, aerobico, forca, observacao')
      .gte('semana', diasAtras(27)).order('semana', { ascending: false }).limit(3000),
    supabase.from('checkins').select('patient_id').gte('created_at', inicio).lt('created_at', fim).limit(5000),
    supabase.from('patients').select('id, nome, celular, ranking_participa').eq('ativo', true).limit(2000),
  ]);

  const linhas = (recentes.data ?? []) as (LinhaCheckin & { observacao: string | null })[];
  const pacientes = new Map(((pacs.data ?? []) as Pac[]).map((p) => [p.id, p]));
  const nome = (id: string) => pacientes.get(id)?.nome ?? 'Paciente';

  // ---- Alertas ----
  const alertas = alertasCheckin(linhas).filter((a) => pacientes.has(a.patient_id));

  // ---- Check-ins no mês (para premiar) ----
  const contagem = new Map<string, number>();
  ((doMes.data ?? []) as { patient_id: string }[]).forEach((c) => {
    if (pacientes.has(c.patient_id)) contagem.set(c.patient_id, (contagem.get(c.patient_id) ?? 0) + 1);
  });
  const rankMes = Array.from(contagem.entries()).sort((a, b) => b[1] - a[1] || nome(a[0]).localeCompare(nome(b[0]), 'pt-BR'));
  const maxMes = Math.max(1, ...rankMes.map((r) => r[1]));

  // ---- Frequência de treino: média de dias por semana nas últimas 4 semanas ----
  const soma = new Map<string, { n: number; aer: number; frc: number }>();
  linhas.forEach((l) => {
    if (!pacientes.has(l.patient_id)) return;
    const s = soma.get(l.patient_id) ?? { n: 0, aer: 0, frc: 0 };
    s.n += 1; s.aer += l.aerobico; s.frc += l.forca;
    soma.set(l.patient_id, s);
  });
  const rankTreino = (k: 'aer' | 'frc') => Array.from(soma.entries())
    .map(([id, s]) => ({ id, media: s[k] / s.n, semanas: s.n }))
    .sort((a, b) => b.media - a.media || b.semanas - a.semanas || nome(a.id).localeCompare(nome(b.id), 'pt-BR'))
    .slice(0, 10);
  const rAer = rankTreino('aer');
  const rFrc = rankTreino('frc');

  const card = 'vidro rounded-[28px] p-5';
  const wa = (id: string) => whatsappDoPaciente(pacientes.get(id)?.celular ?? null);

  return (
    <section className="space-y-4">
      <header>
        <h1 className="font-display text-3xl tracking-tight">Check-ins semanais</h1>
        <p className="mt-1 text-sm text-ash">Notas de 0 a 10 (abaixo de 5 vira alerta) e dias de treino por semana.</p>
      </header>

      <div className={card}>
        <h2 className="font-display text-xl">Precisa de atenção</h2>
        <div className="mt-3 space-y-2.5">
          {alertas.length === 0 && <p className="text-sm text-ash">Nenhum alerta nos check-ins dos últimos 14 dias.</p>}
          {alertas.map((a) => {
            const link = wa(a.patient_id);
            return (
              <div key={a.patient_id} className="cartao-vidro flex gap-3 rounded-[18px] p-3">
                <span className="w-2 shrink-0 rounded" style={{ background: a.humorGrave ? '#C4431F' : '#B8730A' }} />
                <div className="min-w-0 flex-1 text-sm">
                  <Link href={`/paciente/admin/pacientes/${a.patient_id}`} className="font-medium hover:underline">{nome(a.patient_id)}</Link>
                  {a.humorGrave && <span className="ml-2 rounded-full bg-[#C4431F] px-2 py-0.5 text-xs font-semibold text-white">humor muito baixo</span>}
                  <p className="text-xs text-ash">
                    {a.criticos.map((c) => `${c.titulo} ${c.valor}`).join(', ')}
                    {a.criticos.length > 0 && a.semTreino.length > 0 && ' · '}
                    {a.semTreino.length > 0 && `0 dias de ${a.semTreino.map((k) => TITULO[k].toLowerCase()).join(' e ')} há 2 semanas`}
                  </p>
                  {a.observacao && <p className="mt-1 text-xs italic text-graphite">“{a.observacao}”</p>}
                </div>
                {link && <a href={link} target="_blank" rel="noopener noreferrer" className="shrink-0 self-center text-xs font-medium text-terracotta-deep underline">WhatsApp</a>}
              </div>
            );
          })}
        </div>
      </div>

      <div className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl">Check-ins no mês (para premiar)</h2>
          <div className="flex items-center gap-3 text-sm">
            <Link href={`/paciente/admin/checkins?mes=${deslocarMes(mes, -1)}`} className="underline text-ash" aria-label="Mês anterior">‹</Link>
            <span className="font-medium capitalize">{nomeDoMes(mes)}</span>
            {mes < mesAtual() && <Link href={`/paciente/admin/checkins?mes=${deslocarMes(mes, 1)}`} className="underline text-ash" aria-label="Próximo mês">›</Link>}
          </div>
        </div>
        <ol className="mt-4 space-y-3">
          {rankMes.length === 0 && <li className="text-sm text-ash">Nenhum check-in neste mês.</li>}
          {rankMes.slice(0, 15).map(([id, n], i) => (
            <li key={id}>
              <div className="flex justify-between gap-3 text-sm">
                <Link href={`/paciente/admin/pacientes/${id}`} className="font-medium hover:underline">{i + 1}. {nome(id)}</Link>
                <span className="shrink-0 text-ash">{n} {n === 1 ? 'check-in' : 'check-ins'}</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/60">
                <div className="grad-teal h-2.5 rounded-full" style={{ width: `${Math.round((n / maxMes) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-ash">{rankMes.length} paciente(s) responderam neste mês. Cada semana conta um check-in, no máximo.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {([['Aeróbico', rAer], ['Treino de força', rFrc]] as const).map(([titulo, lista]) => (
          <div key={titulo} className={card}>
            <h2 className="font-display text-xl">{titulo}</h2>
            <p className="text-xs text-ash">Média de dias por semana nas últimas 4 semanas</p>
            <ol className="mt-3 space-y-2">
              {lista.length === 0 && <li className="text-sm text-ash">Sem dados ainda.</li>}
              {lista.map((r, i) => (
                <li key={r.id} className="flex justify-between gap-3 text-sm">
                  <Link href={`/paciente/admin/pacientes/${r.id}`} className="hover:underline">
                    {i + 1}. {nome(r.id)}
                    {pacientes.get(r.id)?.ranking_participa === false && <span className="ml-2 text-xs text-ash">(fora da comparação)</span>}
                  </Link>
                  <span className="shrink-0 font-medium">{r.media.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
