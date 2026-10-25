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
          className={`whitespace-nowrap px-3 py-2 text-sm ${ativo(pathname, i) ? 'bg-ink text-ivory' : 'text-graphite hover:bg-sand'}`}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

import { Home, FileText, MessageCircleQuestion, Store, type LucideIcon } from 'lucide-react';

const ICONES: Record<string, LucideIcon> = { feed: Home, documentos: FileText, duvidas: MessageCircleQuestion, indicacoes: Store };
export type PacienteItem = NavItem & { icone: keyof typeof ICONES };

/** Menu do paciente: faixa lateral só com ícones (computador) e abas fixas no topo, abaixo do cabeçalho (celular). */
export function PacienteTabs({ items }: { items: PacienteItem[] }) {
  const pathname = usePathname();
  return (
    <>
      <nav className="fixed inset-y-0 left-0 z-20 hidden w-20 flex-col items-center gap-2 border-r border-mist bg-ivory py-4 md:flex" aria-label="Menu">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-mark.svg" alt="Clínica RS" className="mb-4 h-10 w-10 rounded-full border border-mist p-0.5" />
        {items.map((i) => {
          const Icone = ICONES[i.icone];
          const on = ativo(pathname, i);
          return (
            <Link key={i.href} href={i.href} title={i.label} aria-label={i.label} aria-current={on ? 'page' : undefined}
              className="relative flex h-12 w-full items-center justify-center">
              {on && <span className="absolute left-0 h-8 w-1 bg-ink" />}
              <span className={`flex h-11 w-11 items-center justify-center rounded-full ${on ? 'bg-sand' : 'hover:bg-sand'}`}>
                <Icone strokeWidth={1.5} className="h-6 w-6 stroke-ink" />
              </span>
            </Link>
          );
        })}
      </nav>
      <nav className="sticky top-14 z-10 flex border-b border-mist bg-ivory md:hidden" aria-label="Menu">
        {items.map((i) => {
          const Icone = ICONES[i.icone];
          const on = ativo(pathname, i);
          return (
            <Link key={i.href} href={i.href} aria-current={on ? 'page' : undefined}
              className={`relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-xs ${on ? 'font-semibold text-ink' : 'text-ash'}`}>
              <Icone strokeWidth={on ? 1.8 : 1.5} className={`h-5 w-5 ${on ? 'stroke-ink' : 'stroke-ash'}`} />
              {i.label}
              {on && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-ink" />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
