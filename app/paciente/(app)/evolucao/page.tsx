import { createClient } from '@/lib/supabase/server';
import { curva } from '@/lib/grafico';

export const dynamic = 'force-dynamic';

type Linha = {
  medido_em: string;
  peso: number | null;
  massa_muscular: number | null;
  massa_gordura: number | null;
  percentual_gordura: number | null;
};
type Chave = 'peso' | 'massa_muscular' | 'massa_gordura' | 'percentual_gordura';

const INDICADORES: { chave: Chave; titulo: string; unidade: string; cor: string }[] = [
  { chave: 'peso', titulo: 'Peso', unidade: 'kg', cor: '#1F1B16' },
  { chave: 'massa_muscular', titulo: 'Massa muscular esquelética', unidade: 'kg', cor: '#157A74' },
  { chave: 'massa_gordura', titulo: 'Massa de gordura', unidade: 'kg', cor: '#A66E4E' },
  { chave: 'percentual_gordura', titulo: 'Gordura corporal', unidade: '%', cor: '#C4431F' },
];

const W = 320, H = 84, PAD = 10;
const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dia = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'America/Sao_Paulo' });

function Grafico({ pontos, cor }: { pontos: { v: number; d: string }[]; cor: string }) {
  const vals = pontos.map((p) => p.v);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const base = lo - Math.max(0.5, (hi - lo) * 0.15);
  const { d, pts } = curva(vals.map((v) => v - base), W, H, PAD, Math.max(1, hi - base + (hi - lo) * 0.15));
  return (
    <div className="mt-3">
      <svg viewBox={`-6 0 ${W + 12} ${H}`} className="h-auto w-full" role="img" aria-label="Gráfico da evolução">
        <path d={d} stroke={cor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4.5 : 3} fill={i === pts.length - 1 ? cor : '#FAF7F2'} stroke={cor} strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-ash">
        <span>{pontos[0].d}</span>
        <span>{pontos[pontos.length - 1].d}</span>
      </div>
    </div>
  );
}

export default async function Evolucao() {
  const supabase = createClient();
  const { data: pid } = await supabase.rpc('current_patient_id');
  if (!pid) {
    return <p className="cartao-vidro rounded-[22px] p-5 text-graphite">A evolução é para pacientes. Entre com a conta de um paciente para ver.</p>;
  }

  const { data } = await supabase.from('bioimpedancias')
    .select('medido_em, peso, massa_muscular, massa_gordura, percentual_gordura')
    .eq('patient_id', pid).order('medido_em', { ascending: false }).limit(12);
  const linhas = ((data ?? []) as Linha[]).reverse();

  if (linhas.length === 0) {
    return (
      <section>
        <h1 className="font-display text-2xl">Sua evolução</h1>
        <p className="cartao-vidro mt-4 rounded-[22px] p-5 text-graphite">Seus resultados de bioimpedância aparecem aqui após a avaliação na clínica.</p>
      </section>
    );
  }

  const ultima = linhas[linhas.length - 1];

  return (
    <section className="space-y-3">
      <div>
        <h1 className="font-display text-2xl">Sua evolução</h1>
        <p className="mt-1 text-sm text-ash">Última avaliação: {dia(ultima.medido_em)}</p>
      </div>

      {INDICADORES.map((ind) => {
        const pontos = linhas
          .filter((l) => l[ind.chave] !== null)
          .map((l) => ({ v: Number(l[ind.chave]), d: dia(l.medido_em) }));
        if (pontos.length === 0) return null;
        const atual = pontos[pontos.length - 1].v;
        const dif = pontos.length > 1 ? atual - pontos[pontos.length - 2].v : null;
        return (
          <div key={ind.chave} className="cartao-vidro rounded-[22px] p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-medium text-graphite">{ind.titulo}</h2>
              {dif !== null && Math.abs(dif) >= 0.05 && (
                <span className="text-xs text-ash">{dif > 0 ? '▲' : '▼'} {fmt(Math.abs(dif))} {ind.unidade}</span>
              )}
            </div>
            <p className="mt-1 font-display text-3xl">{fmt(atual)}<span className="ml-1 text-base text-ash">{ind.unidade}</span></p>
            {pontos.length > 1 && <Grafico pontos={pontos} cor={ind.cor} />}
          </div>
        );
      })}

      {linhas.length === 1 && <p className="text-center text-xs text-ash">O gráfico aparece a partir da segunda avaliação.</p>}
    </section>
  );
}
