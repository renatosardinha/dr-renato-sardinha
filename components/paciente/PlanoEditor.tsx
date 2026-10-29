'use client';

import { useEffect, useRef, useState } from 'react';
import { buscarAlimentoPlano, salvarPlano, interpretarPlano } from '@/app/paciente/admin/plano-actions';
import { campo, botao, botaoLeve } from '@/components/paciente/ui';

export type LinhaPlano = {
  refeicao: string; nome: string; alimento_id: string | null; quantidade_g: string; medida: string;
  status?: 'ok' | 'conferir' | 'livre'; original?: string;
};
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
      <div className="grid gap-2 sm:grid-cols-[1fr_1.3fr_90px_120px_auto]">
        <input list="refeicoes" value={l.refeicao} onChange={(e) => onChange({ ...l, refeicao: e.target.value })}
          placeholder="Refeição" aria-label="Refeição" maxLength={40} className={campo} />
        {l.alimento_id ? (
          <div className="flex items-center justify-between gap-2 border border-mist bg-ivory px-3 py-2 text-sm">
            <span>{l.nome}</span>
            <button type="button" onClick={() => { onChange({ ...l, alimento_id: null, nome: '', status: undefined, original: undefined }); setTermo(''); }} className="text-xs underline text-ash">trocar</button>
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
                      onClick={() => { onChange({ ...l, alimento_id: a.id, nome: a.nome, status: undefined, original: undefined }); setAchados([]); setTermo(''); }}>
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
        <input value={l.medida} onChange={(e) => onChange({ ...l, medida: e.target.value })}
          placeholder="Medida (opcional)" aria-label="Medida caseira" maxLength={60} className={campo} />
        <button type="button" onClick={onRemover} className="text-sm underline text-ash">Remover</button>
      </div>
      {l.status === 'conferir' && (
        <p className="text-xs text-terracotta-deep">Confira: você escreveu “{l.original}” e o app entendeu “{l.nome}”{l.quantidade_g ? '' : ', mas faltam os gramas'}.</p>
      )}
      {l.status === 'livre' && (
        <p className="text-xs text-terracotta-deep">Não encontrei “{l.original}” nas tabelas. Fica como texto, sem botão de troca. Para ter troca, busque o alimento na lista.</p>
      )}
      {!l.alimento_id && l.nome.trim() && (
        <p className="text-xs text-ash">Sem escolher na lista, o item aparece só como texto, sem botão de troca (use para itens como suplementos ou "1 scoop").</p>
      )}
    </li>
  );
}

export function PlanoEditor({ pacienteId, inicial }: { pacienteId: string; inicial: LinhaPlano[] }) {
  const [linhas, setLinhas] = useState<LinhaPlano[]>(inicial.length ? inicial : [{ refeicao: REFEICOES[0], nome: '', alimento_id: null, quantidade_g: '', medida: '' }]);
  const muda = (i: number, n: LinhaPlano) => setLinhas((ls) => ls.map((x, j) => (j === i ? n : x)));
  const [texto, setTexto] = useState('');
  const [lendo, setLendo] = useState(false);
  const [aviso, setAviso] = useState('');
  async function preencher() {
    if (!texto.trim()) return;
    setLendo(true);
    const r = await interpretarPlano(texto);
    setLendo(false);
    if (r.linhas.length === 0) { setAviso('Não encontrei nenhuma linha no formato Refeição | Alimento | Gramas.'); return; }
    setLinhas(r.linhas);
    const conferir = r.linhas.filter((x) => x.status !== 'ok').length;
    setAviso(`${r.linhas.length} itens lidos${conferir ? `, ${conferir} para conferir (marcados abaixo)` : ', todos reconhecidos'}.${r.ignoradas ? ` ${r.ignoradas} linha(s) ignorada(s) por falta de formato.` : ''}${r.cortado ? ' Só as primeiras 200 linhas foram lidas.' : ''} Confira e clique em Salvar plano.`);
    setTexto('');
  }
  const nova = () => setLinhas((ls) => [...ls, { refeicao: ls[ls.length - 1]?.refeicao ?? REFEICOES[0], nome: '', alimento_id: null, quantidade_g: '', medida: '' }]);

  return (
    <div className="space-y-6">
    <div className="vidro space-y-2 rounded-[22px] p-4">
      <label htmlFor="colar" className="font-medium">Colar plano (texto do projeto Planos Terapêuticos)</label>
      <textarea id="colar" value={texto} onChange={(e) => setTexto(e.target.value)} rows={6} spellCheck={false}
        placeholder={'Café da manhã | Pão francês | 50 | 1 unidade\nAlmoço | Arroz branco cozido | 100\nAlmoço | Peito de frango grelhado | 150'}
        className="w-full border border-mist bg-ivory px-3 py-2 font-mono text-sm outline-none focus:border-terracotta" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={preencher} disabled={lendo || !texto.trim()} className={`${botao} disabled:opacity-60`}>{lendo ? 'Lendo...' : 'Preencher a partir do texto'}</button>
        <span className="text-xs text-ash">Isso substitui as linhas abaixo. Nada é salvo até você clicar em Salvar plano.</span>
      </div>
      {aviso && <p role="status" className="text-sm text-graphite">{aviso}</p>}
    </div>
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
    </div>
  );
}
