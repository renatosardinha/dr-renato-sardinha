import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { curva } from '@/lib/grafico';
import {
  ITENS, dicaPara, segundaDaSemana, mesAtual, limitesDoMes, HUMOR_GRAVE_ATE,
  WHATSAPP_PROFISSIONAL, type Item, type LinhaCheckin,
} from '@/lib/checkin';
import { Avisos } from '@/components/paciente/Avisos';
import { salvarCheckin, definirRanking } from './actions';

export const dynamic = 'force-dynamic';

type Linha = LinhaCheckin & { observacao: string | null; created_at: string };

function Escala({ item, atual }: { item: Item; atual?: number }) {
  const opcoes = Array.from({ length: item.max + 1 }, (_, n) => n);
  const colunas = item.max === 10 ? 'grid-cols-6 sm:grid-cols-11' : 'grid-cols-8';
  return (
    <fieldset className="cartao-vidro rounded-[22px] p-4">
      <legend className="sr-only">{item.titulo}</legend>
      <p className="font-medium">{item.pergunta}</p>
      <p className="mb-3 mt-0.5 text-xs text-ash">{item.ajuda}</p>
      <div className={`grid ${colunas} gap-1.5`}>
        {opcoes.map((n) => (
          <label key={n} className="cursor-pointer">
            <input type="radio" name={item.chave} value={n} defaultChecked={atual === n} required className="peer sr-only" />
            <span className="flex h-11 items-center justify-center rounded-xl border border-white/80 bg-white/50 text-sm font-medium text-graphite peer-checked:border-transparent peer-checked:bg-ink peer-checked:text-ivory peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta">
              {n}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function bandaRanking(acima: number, total: number, media: number) {
  if (media <= 0) return 'Cada semana conta. Que tal começar com um dia nesta semana?';
  const topo = Math.ceil(((acima + 1) / total) * 100);
  if (topo <= 10) return 'Você está entre os 10% que mais fazem. Excelente!';
  if (topo <= 25) return 'Você está entre os 25% que mais fazem. Muito bom!';
  if (topo <= 50) return 'Você está entre os 50% que mais fazem. Continue assim!';
  return 'Cada semana conta. Que tal mais um dia nesta semana?';
}

export default async function Checkin({ searchParams }: { searchParams: { editar?: string; erro?: string } }) {
  const supabase = createClient();
  const { data: pid } = await supabase.rpc('current_patient_id');
  if (!pid) {
    return <p className="cartao-vidro rounded-[22px] p-5 text-graphite">O check-in é para pacientes. Entre com a conta de um paciente para testar.</p>;
  }

  const { data: linhas } = await supabase.from('checkins')
    .select('patient_id, semana, humor, sono, energia, saciedade, plano, aerobico, forca, observacao, created_at')
    .eq('patient_id', pid).order('semana', { ascending: false }).limit(12);
  const historico = (linhas ?? []) as Linha[];
  const semana = segundaDaSemana();
  const atual = historico.find((l) => l.semana === semana);

  // ---------- Formulário ----------
  if (!atual || searchParams.editar) {
    return (
      <section>
        <h1 className="font-display text-2xl">Check-in da semana</h1>
        <p className="mt-1 text-sm text-ash">Leva cerca de um minuto. Toque em uma nota para cada item.</p>
        <div className="mt-3"><Avisos erro={searchParams.erro} /></div>
        <form action={salvarCheckin} className="space-y-3">
          {ITENS.map((i) => <Escala key={i.chave} item={i} atual={atual?.[i.chave]} />)}
          <div className="cartao-vidro rounded-[22px] p-4">
            <label htmlFor="obs" className="font-medium">Quer contar mais alguma coisa? (opcional)</label>
            <textarea id="obs" name="observacao" maxLength={300} rows={3} defaultValue={atual?.observacao ?? ''}
              className="mt-2 w-full rounded-xl border border-white/80 bg-white/60 px-3 py-2 text-base outline-none focus:border-terracotta" />
            <p className="mt-2 text-xs text-ash">
              A equipe da clínica pode ver suas respostas, mas não em tempo real. Em caso de urgência, ligue para a clínica
              ou procure atendimento.
            </p>
          </div>
          <button className="aba-ativa min-h-[48px] w-full rounded-full px-6 text-base font-medium">Enviar check-in</button>
        </form>
      </section>
    );
  }

  // ---------- Resultado ----------
  const dicas = ITENS.map((i) => ({ i, texto: dicaPara(i.chave, atual[i.chave]) })).filter((x) => x.texto);
  const humorGrave = atual.humor <= HUMOR_GRAVE_ATE;

  const { inicio, fim } = limitesDoMes(mesAtual());
  const noMes = historico.filter((l) => l.created_at >= new Date(inicio).toISOString() && l.created_at < new Date(fim).toISOString()).length;

  const { data: pac } = await supabase.from('patients').select('ranking_participa').eq('id', pid).maybeSingle();
  const participa = pac?.ranking_participa !== false;
  const { data: rk } = participa ? await supabase.rpc('meu_ranking') : { data: [] as { item: string; minha_media: number; participantes: number; acima: number }[] };
  const ranking = ((rk ?? []) as { item: 'aerobico' | 'forca'; minha_media: number; participantes: number; acima: number }[])
    .filter((r) => r.participantes >= 10);

  const cronologico = [...historico].reverse().slice(-8);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-display text-2xl">Check-in da semana</h1>
        <p className="mt-1 text-sm text-ash">Obrigado! Você fez {noMes} {noMes === 1 ? 'check-in' : 'check-ins'} neste mês.</p>
      </div>

      {humorGrave && (
        <div className="cartao-vidro rounded-[22px] border-l-4 border-[#C4431F] p-5" role="alert">
          <p className="font-medium">Sinto muito que a semana esteja pesada.</p>
          <p className="mt-2 text-sm text-graphite">
            Você não precisa passar por isso sem apoio. Fale com o Dr. Renato pelo WhatsApp.
            Ele não é um canal de urgência, então pode demorar a responder.
          </p>
          <a href={WHATSAPP_PROFISSIONAL} target="_blank" rel="noopener noreferrer"
            className="aba-ativa mt-3 inline-flex min-h-[46px] items-center rounded-full px-5 text-sm font-medium">
            Falar com o Dr. Renato
          </a>
          <p className="mt-3 text-sm text-graphite">
            Se você está pensando em se machucar ou sente que não está seguro, ligue agora para o <b>CVV, 188</b> (24 horas, gratuito)
            ou para o <b>SAMU, 192</b>.
          </p>
        </div>
      )}

      {dicas.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg">Dicas para esta semana</h2>
          {dicas.map(({ i, texto }) => (
            <div key={i.chave} className="cartao-vidro rounded-[22px] p-4">
              <p className="text-sm font-medium text-terracotta-deep">{i.titulo}: {atual[i.chave]}{i.unidade === 'dias' ? ` ${atual[i.chave] === 1 ? 'dia' : 'dias'}` : ''}</p>
              <p className="mt-1 text-sm text-graphite">{texto}</p>
            </div>
          ))}
          <p className="text-xs text-ash">Dicas gerais de educação em saúde. Elas não substituem a orientação da sua consulta.</p>
        </div>
      )}
      {dicas.length === 0 && !humorGrave && (
        <p className="cartao-vidro rounded-[22px] p-4 text-sm text-graphite">Tudo certo por aqui. Continue assim!</p>
      )}

      <div className="cartao-vidro rounded-[22px] p-4">
        <h2 className="font-display text-lg">Sua evolução</h2>
        <ul className="mt-2 divide-y divide-white/60">
          {ITENS.map((i) => {
            const serie = cronologico.map((l) => l[i.chave]);
            const s = serie.length > 1 ? curva(serie, 110, 32, 4, i.max).d : null;
            return (
              <li key={i.chave} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>{i.titulo}</span>
                <span className="flex items-center gap-3">
                  {s && (
                    <svg aria-hidden="true" width="110" height="32" viewBox="0 0 110 32" fill="none">
                      <path d={s} stroke="#157A74" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <b className="w-12 text-right">{atual[i.chave]}{i.unidade === 'dias' ? 'd' : '/10'}</b>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-ash">Últimas {cronologico.length} {cronologico.length === 1 ? 'semana' : 'semanas'}.</p>
      </div>

      {(ranking.length > 0 || !participa) && (
        <div className="cartao-vidro rounded-[22px] p-4">
          <h2 className="font-display text-lg">Frequência entre os pacientes</h2>
          {participa ? (
            <ul className="mt-2 space-y-2 text-sm text-graphite">
              {ranking.map((r) => (
                <li key={r.item}>
                  <b>{r.item === 'aerobico' ? 'Aeróbico' : 'Treino de força'}</b> ({Number(r.minha_media).toLocaleString('pt-BR')} dias por semana, média de 4 semanas):{' '}
                  {bandaRanking(r.acima, r.participantes, Number(r.minha_media))}
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-graphite">Você optou por não participar da comparação.</p>}
          <p className="mt-2 text-xs text-ash">Ninguém vê o seu nome na comparação entre pacientes.</p>
          <form action={definirRanking} className="mt-2">
            <input type="hidden" name="participa" value={participa ? '0' : '1'} />
            <button className="text-sm underline text-ash">{participa ? 'Não quero participar desta comparação' : 'Quero participar da comparação'}</button>
          </form>
        </div>
      )}

      <Link href="/paciente/checkin?editar=1" className="block text-center text-sm underline text-ash">Corrigir minhas respostas desta semana</Link>
    </section>
  );
}
