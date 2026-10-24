import { BadgeCheck } from 'lucide-react';

/** Linha de identidade de cada post: marca da clínica + nome + selo + data. */
export function PostCabecalho({ data }: { data: string }) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-mark.svg" alt="" className="h-10 w-10 rounded-full border border-mist bg-ivory p-0.5" />
      <div className="flex min-w-0 items-center gap-1.5 text-[15px]">
        <span className="font-semibold">Dr. Renato Sardinha</span>
        <BadgeCheck className="h-4 w-4 shrink-0 fill-terracotta-deep stroke-ivory" aria-label="Perfil oficial" />
        <span className="text-ash">· {new Date(data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  );
}
