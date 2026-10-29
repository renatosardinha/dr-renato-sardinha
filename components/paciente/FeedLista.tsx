'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AlignLeft, ChevronRight, Play, Search, X } from 'lucide-react';
import { campo } from './ui';

export type ItemFeed = { id: string; titulo: string; data: string; video: boolean; busca: string };

const GRADS = ['grad-coral', 'grad-teal', 'grad-ambar', 'grad-roxo'];
const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Lista limpa do feed: só o título (clicável) e a data, com busca por título e texto. */
export function FeedLista({ itens }: { itens: ItemFeed[] }) {
  const [q, setQ] = useState('');
  const filtrados = useMemo(() => {
    const termo = sem(q.trim());
    return termo ? itens.filter((i) => i.busca.includes(termo)) : itens;
  }, [q, itens]);

  return (
    <div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" aria-hidden />
        <input
          type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nas publicações"
          aria-label="Buscar nas publicações"
          className={`${campo} vidro rounded-full pl-9 pr-9`}
        />
        {q && (
          <button type="button" onClick={() => setQ('')} aria-label="Limpar busca"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-ash">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filtrados.length === 0 ? (
        <p className="rounded-[18px] border border-mist bg-ivory p-6 text-ash">Nenhuma publicação encontrada.</p>
      ) : (
        <ul className="space-y-2.5">
          {filtrados.map((i, n) => (
            <li key={i.id}>
              <Link href={`/paciente/post/${i.id}`} className="cartao-vidro flex min-h-[64px] items-center gap-3.5 rounded-[22px] px-3.5 py-3 active:bg-sand">
                <span className={`${GRADS[n % GRADS.length]} flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]`} aria-hidden>
                  {i.video ? <Play className="h-[18px] w-[18px] fill-white stroke-white" /> : <AlignLeft strokeWidth={2} className="h-[18px] w-[18px] stroke-white" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium leading-snug">{i.titulo}</span>
                  <span className="mt-0.5 block text-xs text-ash">
                    {new Date(i.data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {i.video && <span className="sr-only"> (vídeo)</span>}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-ash" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
