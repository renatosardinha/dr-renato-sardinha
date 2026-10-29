'use client';

import { useEffect, useRef, useState } from 'react';
import { buscarAlimentoPlano, salvarPlano } from '@/app/paciente/admin/plano-actions';
import { campo, botao, botaoLeve } from '@/components/paciente/ui';

export type LinhaPlano = { refeicao: string; nome: string; alimento_id: string | null; quantidade_g: string };
type Achado = { id: string; nome: string; kcal: number | null; fonte: string };

const REFEICOES = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'];

function Linha({ l, onChange, onRemover }: { l: LinhaPlano; onChange: (n: LinhaPlano) => void; onRemover: () => void }) {
  const [termo, setTermo] = useState('');
  const [achados, setAchados] = useState<Achado[]>([]);
  const [buscando, setBuscando] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    if (l.alimento_id || termo.trim().length < 2) { setAchados([]); return; }
    const minha = ++seq.current;
    setBuscando(true);
    const t = setTimeout(async () => {
      const r = await buscarAlimentoPlano(termo);
      if (minha === seq.current) { setAchados(r); setBuscando(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [termo, l.alimento_id]);

  return (
    <li className="vidro space-y-2 rounded-[18px] p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_110px_auto]">
        <input list="refeicoes" value={l.refeicao} onChange={(e) => onChange({ ...l, refeicao: e.target.value })}
          placeholder="Refeição" aria-label="Refeição" maxLength={40} className={campo} />
        {l.alimento_id ? (
          <div className="flex items-center justify-between gap-2 border border-mist bg-ivory px-3 py-2 text-sm">
            <span>{l.nome}</span>
            <button type="button" onClick={() => { onChange({ ...l, alimento_id: null, nome: '' }); setTermo(''); }} className="text-xs underline text-ash">trocar</button>
          </div>
        ) : (
          <div className="relative">
            <input value={termo || l.nome} onChange={(e) => { setTermo(e.target.value); onChange({ ...l, nome: e.target.value }); }}
              placeholder="Buscar alimento (ex.: arroz)" aria-label="Alimento" maxLength={120} className={campo} />
            {(achados.length > 0 || buscando) && (
              <ul className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto border border-mist bg-ivory text-sm shadow-lg">
                {buscando && <li className="px-3 py-2 text-ash">Buscando...</li>}
                {achados.map((a) => (
                  <li key={a.id}>
                    <button type="button" className="block w-full px-3 py-2 text-left hover:bg-sand"
                      onClick={() => { onChange({ ...l, alimento_id: a.id, nome: a.nome }); setAchados([]); setTermo(''); }}>
                      {a.nome} <span className="text-xs text-ash">({a.fonte}{a.kcal != null ? `, ${a.kcal} kcal/100 g` : ''})</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <input value={l.quantidade_g} onChange={(e) => onChange({ ...l, quantidade_g: e.target.value.replace(',', '.') })}
          inputMode="decimal" placeholder="Gramas" aria-label="Gramas" className={campo} />
        <button type="button" onClick={onRemover} className="text-sm underline text-ash">Remover</button>
      </div>
      {!l.alimento_id && l.nome.trim() && (
        <p className="text-xs text-ash">Sem escolher na lista, o item aparece só como texto, sem botão de troca (use para itens como suplementos ou "1 scoop").</p>
      )}
    </li>
  );
}

export function PlanoEditor({ pacienteId, inicial }: { pacienteId: string; inicial: LinhaPlano[] }) {
  const [linhas, setLinhas] = useState<LinhaPlano[]>(inicial.length ? inicial : [{ refeicao: REFEICOES[0], nome: '', alimento_id: null, quantidade_g: '' }]);
  const muda = (i: number, n: LinhaPlano) => setLinhas((ls) => ls.map((x, j) => (j === i ? n : x)));
  const nova = () => setLinhas((ls) => [...ls, { refeicao: ls[ls.length - 1]?.refeicao ?? REFEICOES[0], nome: '', alimento_id: null, quantidade_g: '' }]);

  return (
    <form action={salvarPlano} className="space-y-3">
      <input type="hidden" name="patient_id" value={pacienteId} />
      <input type="hidden" name="itens" value={JSON.stringify(linhas)} />
      <datalist id="refeicoes">{REFEICOES.map((r) => <option key={r} value={r} />)}</datalist>
      <ul className="space-y-2">
        {linhas.map((l, i) => (
          <Linha key={i} l={l} onChange={(n) => muda(i, n)} onRemover={() => setLinhas((ls) => ls.filter((_, j) => j !== i))} />
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={nova} className={botaoLeve}>+ Adicionar item</button>
        <button className={botao}>Salvar plano</button>
      </div>
      <p className="text-xs text-ash">Salvar substitui o plano anterior deste paciente. Itens na mesma refeição aparecem juntos, na ordem desta lista.</p>
    </form>
  );
}
