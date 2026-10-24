'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { alternarCurtida } from '@/app/paciente/(app)/actions';

export function LikeButton({ postId, total, curtiu }: { postId: string; total: number; curtiu: boolean }) {
  const [estado, setEstado] = useState({ total, curtiu });
  const [, iniciar] = useTransition();

  function alternar() {
    const anterior = estado;
    setEstado({ curtiu: !anterior.curtiu, total: Math.max(0, anterior.total + (anterior.curtiu ? -1 : 1)) });
    iniciar(async () => {
      const r = await alternarCurtida(postId);
      if (!r.ok) setEstado(anterior);
    });
  }

  return (
    <button type="button" onClick={alternar} aria-pressed={estado.curtiu}
      aria-label={estado.curtiu ? 'Remover curtida' : 'Curtir'}
      className="group -ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm text-graphite hover:bg-sand">
      <Heart strokeWidth={1.5}
        className={`h-6 w-6 transition-colors ${estado.curtiu ? 'fill-terracotta-deep stroke-terracotta-deep' : 'stroke-ink group-hover:stroke-terracotta-deep'}`} />
      {estado.total > 0 && <span>{estado.total}</span>}
    </button>
  );
}
