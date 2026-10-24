'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopiarCupom({ codigo }: { codigo: string }) {
  const [ok, setOk] = useState(false);
  async function copiar() {
    try { await navigator.clipboard.writeText(codigo); setOk(true); setTimeout(() => setOk(false), 2000); } catch { /* sem permissão: o código continua visível */ }
  }
  return (
    <button type="button" onClick={copiar}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-terracotta-deep px-4 text-sm font-semibold text-terracotta-deep">
      {ok ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Cupom: {codigo}
    </button>
  );
}
