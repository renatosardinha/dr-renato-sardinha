import { createClient } from '@/lib/supabase/server';
import { CopiarCupom } from '@/components/paciente/CopiarCupom';
import { CATEGORIAS_ROTULO } from '@/components/paciente/IndicacaoForm';

export const dynamic = 'force-dynamic';

type Item = { id: string; categoria: string; nome: string; descricao: string | null; whatsapp: string | null; instagram: string | null; site: string | null; cupom: string | null };

const pill = 'inline-flex min-h-11 items-center rounded-full border border-mist px-4 text-sm font-semibold hover:bg-sand';

export default async function Indicacoes() {
  const { data } = await createClient().from('indicacoes')
    .select('id, categoria, nome, descricao, whatsapp, instagram, site, cupom')
    .eq('ativo', true).order('ordem').order('nome');
  const itens = (data ?? []) as Item[];
  const grupos = Object.keys(CATEGORIAS_ROTULO).map((c) => ({ c, lista: itens.filter((i) => i.categoria === c) })).filter((g) => g.lista.length);

  return (
    <section>
      <h1 className="font-display text-2xl">Indicações</h1>
      <p className="mt-1 text-sm text-ash">Sugestões da clínica. Confirme valores e condições diretamente com cada local.</p>
      {grupos.length === 0 ? (
        <p className="mt-4 rounded-[18px] border border-mist bg-ivory p-6 text-ash">Em breve.</p>
      ) : grupos.map((g) => (
        <div key={g.c} className="mt-6">
          <h2 className="text-eyebrow uppercase tracking-editorial text-terracotta">{CATEGORIAS_ROTULO[g.c]}</h2>
          <ul className="mt-2 space-y-3">
            {g.lista.map((i) => (
              <li key={i.id} className="rounded-[18px] border border-mist bg-ivory p-4">
                <p className="font-semibold">{i.nome}</p>
                {i.descricao && <p className="mt-1 text-[15px] text-graphite">{i.descricao}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {i.whatsapp && <a href={`https://wa.me/${i.whatsapp}`} target="_blank" rel="noopener noreferrer" className={pill}>WhatsApp</a>}
                  {i.instagram && <a href={i.instagram} target="_blank" rel="noopener noreferrer" className={pill}>Instagram</a>}
                  {i.site && <a href={i.site} target="_blank" rel="noopener noreferrer" className={pill}>Site</a>}
                  {i.cupom && <CopiarCupom codigo={i.cupom} />}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
