import { campo, rotulo } from '@/components/paciente/ui';

export const CATEGORIAS_ROTULO: Record<string, string> = {
  farmacia: 'Farmácias de manipulação',
  suplementos: 'Suplementos',
  profissionais: 'Profissionais',
  servicos: 'Serviços',
  outros: 'Outros',
};

type Valores = { categoria?: string; nome?: string; descricao?: string | null; whatsapp?: string | null; instagram?: string | null; site?: string | null; cupom?: string | null; ordem?: number };

/** Campos compartilhados entre "nova indicação" e "editar". */
export function CamposIndicacao({ v = {} }: { v?: Valores }) {
  return (
    <>
      <div>
        <label className={rotulo}>Categoria</label>
        <select name="categoria" defaultValue={v.categoria ?? 'farmacia'} className={campo}>
          {Object.entries(CATEGORIAS_ROTULO).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
        </select>
      </div>
      <div><label className={rotulo}>Nome</label><input name="nome" required defaultValue={v.nome ?? ''} className={campo} /></div>
      <div><label className={rotulo}>Descrição (uma linha)</label><input name="descricao" defaultValue={v.descricao ?? ''} className={campo} /></div>
      <div><label className={rotulo}>WhatsApp (com DDD)</label><input name="whatsapp" inputMode="tel" defaultValue={v.whatsapp ?? ''} className={campo} /></div>
      <div><label className={rotulo}>Instagram (@usuario ou link)</label><input name="instagram" defaultValue={v.instagram ?? ''} className={campo} /></div>
      <div><label className={rotulo}>Site</label><input name="site" defaultValue={v.site ?? ''} className={campo} /></div>
      <div><label className={rotulo}>Cupom de desconto (opcional)</label><input name="cupom" defaultValue={v.cupom ?? ''} className={campo} /></div>
      <div><label className={rotulo}>Ordem na lista (0 aparece primeiro)</label><input name="ordem" type="number" defaultValue={v.ordem ?? 0} className={campo} /></div>
    </>
  );
}
