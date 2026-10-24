'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { importarPlanilha, type Resultado } from './actions';
import { campo, botao, botaoLeve } from '@/components/paciente/ui';

function Botoes() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-3">
      <button name="modo" value="previa" disabled={pending} className={botaoLeve}>{pending ? 'Analisando…' : '1. Ver prévia'}</button>
      <button name="modo" value="importar" disabled={pending} className={botao}>{pending ? 'Aguarde…' : '2. Importar'}</button>
    </div>
  );
}

export function ImportarForm() {
  const [r, action] = useFormState<Resultado, FormData>(importarPlanilha, null);
  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="file" name="arquivo" accept=".csv,text/csv" required className={campo} />
      <Botoes />
      {r?.erro && <p className="border border-terracotta p-3 text-sm text-terracotta">{r.erro}</p>}
      {r && !r.erro && (
        <div className="border border-mist bg-ivory p-4 text-sm">
          <p className="font-medium">{r.modo === 'importar' ? 'Importação concluída' : 'Prévia (nada foi salvo ainda)'}</p>
          <ul className="mt-2 space-y-1">
            <li>{r.novos} paciente(s) novo(s){r.modo === 'importar' ? ' cadastrado(s)' : ' serão cadastrados'}</li>
            <li>{r.atualizados} já existiam e {r.modo === 'importar' ? 'foram atualizados' : 'terão nome ou celular atualizado'}</li>
            <li>{r.iguais} já existiam e estão iguais</li>
            <li>{r.semEmail} sem e-mail válido (ficam de fora; cadastre depois quando tiver o e-mail)</li>
            <li>{r.falhas} com e-mail repetido na planilha (ficam de fora, só o primeiro de cada e-mail entra)</li>
          </ul>
          {r.repetidos.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer">Ver os que ficaram de fora por e-mail repetido</summary>
              <ul className="mt-2 space-y-1 text-graphite">
                {r.repetidos.map((p, i) => <li key={i}>{p.nome} · {p.email}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </form>
  );
}
