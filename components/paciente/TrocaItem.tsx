'use client';

import { useState } from 'react';
import { opcoesTroca, buscarTroca, calcularTroca } from '@/app/paciente/(app)/plano/actions';
import type { ResultadoTroca } from '@/lib/agente/trocas';

type Opcao = { id: string; nome: string; tabela: string };

export function ItemPlano({ itemId, nome, gramas, medida, trocavel }: {
  itemId: string; nome: string; gramas: number | null; medida: string | null; trocavel: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [curadas, setCuradas] = useState<Opcao[] | null>(null);
  const [outras, setOutras] = useState(false);
  const [termo, setTermo] = useState('');
  const [achadas, setAchadas] = useState<Opcao[] | null>(null);
  const [res, setRes] = useState<ResultadoTroca | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function alternar() {
    const novo = !aberto;
    setAberto(novo);
    if (novo && curadas === null) setCuradas(await opcoesTroca(itemId));
  }
  async function escolher(id: string) {
    setCarregando(true);
    setRes(await calcularTroca(itemId, id));
    setCarregando(false);
  }
  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (termo.trim().length < 2) return;
    setAchadas(null);
    setAchadas(await buscarTroca(itemId, termo));
  }

  const opcao = 'cartao-vidro w-full rounded-2xl px-4 py-2.5 text-left text-sm';
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 flex-1 text-sm">
          {nome}
          {gramas != null && <span className="ml-2 whitespace-nowrap font-medium">{gramas.toLocaleString('pt-BR')} g</span>}
          {medida && <span className="ml-1 text-ash">({medida})</span>}
        </span>
        {trocavel && (
          <button type="button" onClick={alternar} aria-expanded={aberto}
            className="shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-ivory">{aberto ? 'Fechar' : 'Trocar'}</button>
        )}
      </div>

      {aberto && (
        <div className="mt-3 w-full space-y-3 rounded-[18px] bg-white/50 p-3">
          <p className="text-sm text-graphite">Trocar <b>{gramas?.toLocaleString('pt-BR')} g de {nome}</b> por:</p>
          {curadas === null && <p className="text-sm text-ash">Carregando...</p>}
          {curadas && curadas.length > 0 && (
            <ul className="space-y-1.5">
              {curadas.map((o) => <li key={o.id}><button type="button" onClick={() => escolher(o.id)} className={opcao}>{o.nome}</button></li>)}
            </ul>
          )}
          {curadas && curadas.length === 0 && <p className="text-sm text-ash">Sem sugestões prontas para este item. Use “Buscar outro alimento”.</p>}

          {!outras
            ? <button type="button" onClick={() => setOutras(true)} className="text-sm underline text-ash">Buscar outro alimento</button>
            : (
              <div className="space-y-2">
                <form onSubmit={buscar} className="flex gap-2">
                  <input value={termo} onChange={(e) => setTermo(e.target.value)} placeholder="Ex.: tapioca"
                    aria-label="Buscar alimento" maxLength={60} className="min-w-0 flex-1 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm outline-none" />
                  <button className="aba-ativa shrink-0 rounded-full px-4 py-2 text-sm font-medium">Buscar</button>
                </form>
                {achadas && achadas.length === 0 && <p className="text-sm text-ash">Nada encontrado para esse tipo de troca. Tente outro nome ou fale com a clínica.</p>}
                {achadas && achadas.length > 0 && (
                  <ul className="space-y-1.5">
                    {achadas.map((o) => <li key={o.id}><button type="button" onClick={() => escolher(o.id)} className={opcao}>{o.nome}</button></li>)}
                  </ul>
                )}
                <p className="text-xs text-ash">Opções aproximadas, calculadas pela tabela TACO.</p>
              </div>
            )}

          {carregando && <p className="text-sm text-ash">Calculando...</p>}
          {res && !carregando && (res.ok ? (
            <div className="rounded-[16px] border border-white/80 bg-white/70 p-3 text-sm" role="status">
              <p>
                Troque <b>{res.de.gramas.toLocaleString('pt-BR')} g de {res.de.nome}</b> por{' '}
                <b>{res.para.gramas_arredondadas_5g.toLocaleString('pt-BR')} g de {res.para.nome}</b>.
              </p>
              <p className="mt-1 text-xs text-ash">Conta: {res.conta} (critério: {res.criterio}). Valor exato: {res.para.gramas_exatas.toLocaleString('pt-BR')} g, arredondado para 5 g.</p>
              {res.avisos.map((a) => <p key={a} className="mt-1 text-xs text-terracotta-deep">{a}</p>)}
              <p className="mt-1 text-xs text-ash">Fonte: {res.fontes.join('; ')}.</p>
            </div>
          ) : <p className="text-sm text-terracotta-deep" role="alert">{res.erro}</p>)}
        </div>
      )}
    </div>
  );
}
