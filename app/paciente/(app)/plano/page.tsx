import { createClient } from '@/lib/supabase/server';
import { TrocaItem } from '@/components/paciente/TrocaItem';

export const dynamic = 'force-dynamic';

type Item = { id: string; refeicao: string; nome: string; alimento_id: string | null; quantidade_g: number | null; medida: string | null; created_at: string };

export default async function MeuPlano() {
  const supabase = createClient();
  const { data: pid } = await supabase.rpc('current_patient_id');
  if (!pid) {
    return <p className="cartao-vidro rounded-[22px] p-5 text-graphite">O plano é para pacientes. Entre com a conta de um paciente para testar.</p>;
  }
  const { data } = await supabase.from('plan_items')
    .select('id, refeicao, nome, alimento_id, quantidade_g, medida, created_at').eq('patient_id', pid).order('ordem');
  const itens = ((data ?? []) as Item[]).map((i) => ({ ...i, quantidade_g: i.quantidade_g == null ? null : Number(i.quantidade_g) }));

  if (itens.length === 0) {
    return (
      <section>
        <h1 className="font-display text-2xl">Meu plano</h1>
        <p className="cartao-vidro mt-4 rounded-[22px] p-5 text-graphite">Seu plano alimentar ainda não foi cadastrado no app. Fale com a clínica na sua próxima consulta.</p>
      </section>
    );
  }

  const refeicoes: { nome: string; itens: typeof itens }[] = [];
  for (const i of itens) {
    const r = refeicoes.find((x) => x.nome === i.refeicao);
    if (r) r.itens.push(i); else refeicoes.push({ nome: i.refeicao, itens: [i] });
  }
  const atualizado = itens.map((i) => i.created_at).sort().pop()!;

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-display text-2xl">Meu plano</h1>
        <p className="mt-1 text-sm text-ash">Atualizado em {new Date(atualizado).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}. Toque em “Trocar” para ver equivalências.</p>
      </div>
      {refeicoes.map((r) => (
        <div key={r.nome} className="cartao-vidro rounded-[22px] p-4">
          <h2 className="font-display text-lg">{r.nome}</h2>
          <ul className="mt-2 divide-y divide-white/60">
            {r.itens.map((i) => (
              <li key={i.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 text-sm">
                    {i.nome}
                    {i.quantidade_g != null && <span className="ml-2 font-medium">{i.quantidade_g.toLocaleString('pt-BR')} g</span>}
                    {i.medida && <span className="ml-1 text-ash">({i.medida})</span>}
                  </span>
                  {i.alimento_id && i.quantidade_g != null && <span className="shrink-0"><TrocaItem itemId={i.id} nome={i.nome} gramas={i.quantidade_g} /></span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-xs text-ash">
        As trocas usam as tabelas da clínica e da TACO (Unicamp). São equivalências para o dia a dia: em caso de dúvida,
        siga o plano ou fale com a equipe da clínica.
      </p>
    </section>
  );
}
