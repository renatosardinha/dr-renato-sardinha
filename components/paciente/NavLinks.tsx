'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; label: string; exact?: boolean };

function ativo(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');
}

/** Menu lateral (admin) — vira faixa rolável no celular. */
export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible" aria-label="Menu do painel">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={ativo(pathname, i) ? 'page' : undefined}
          className={`flex min-h-[44px] items-center whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-medium ${ativo(pathname, i) ? 'aba-ativa' : 'text-graphite hover:bg-sand'}`}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

import { Home, FileText, MessageCircleQuestion, Store, ClipboardCheck, Utensils, type LucideIcon } from 'lucide-react';

const ICONES: Record<string, LucideIcon> = { feed: Home, documentos: FileText, duvidas: MessageCircleQuestion, indicacoes: Store, checkin: ClipboardCheck, plano: Utensils };
export type PacienteItem = NavItem & { icone: keyof typeof ICONES };

/** Menu do paciente: faixa lateral só com ícones (computador) e abas fixas no topo, abaixo do cabeçalho (celular). */
export function PacienteTabs({ items }: { items: PacienteItem[] }) {
  const pathname = usePathname();
  return (
    <>
      <nav className="vidro fixed inset-y-0 left-0 z-20 hidden w-20 flex-col items-center gap-2 rounded-none border-y-0 border-l-0 py-4 md:flex" aria-label="Menu">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-mark.svg" alt="Clínica RS" className="mb-4 h-10 w-10 rounded-full border border-white/80 bg-white/60 p-0.5" />
        {items.map((i) => {
          const Icone = ICONES[i.icone];
          const on = ativo(pathname, i);
          return (
            <Link key={i.href} href={i.href} title={i.label} aria-label={i.label} aria-current={on ? 'page' : undefined}
              className="relative flex h-12 w-full items-center justify-center">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${on ? 'aba-ativa' : 'hover:bg-sand'}`}>
                <Icone strokeWidth={1.7} className={`h-6 w-6 ${on ? 'stroke-white' : 'stroke-ink'}`} />
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="sticky top-14 z-10 px-3 pt-3 md:hidden">
        <nav className="vidro flex gap-1 overflow-x-auto rounded-[22px] p-1" aria-label="Menu">
          {items.map((i) => {
            const Icone = ICONES[i.icone];
            const on = ativo(pathname, i);
            return (
              <Link key={i.href} href={i.href} aria-current={on ? 'page' : undefined}
                className={`flex min-h-[48px] min-w-[62px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[17px] text-[11px] font-medium ${on ? 'aba-ativa' : 'text-graphite'}`}>
                <Icone strokeWidth={on ? 1.9 : 1.6} className={`h-[18px] w-[18px] ${on ? 'stroke-white' : 'stroke-ink'}`} />
                {i.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
