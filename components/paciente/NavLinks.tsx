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

/** Menu do paciente: barra no topo (desktop) e barra fixa embaixo (celular). */
export function PacienteTabs({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const cls = (i: NavItem) =>
    `px-3 py-2 text-sm ${ativo(pathname, i) ? 'text-ink border-b-2 border-terracotta' : 'text-ash'}`;
  return (
    <>
      <nav className="hidden gap-2 md:flex" aria-label="Menu">
        {items.map((i) => <Link key={i.href} href={i.href} className={cls(i)}>{i.label}</Link>)}
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-mist bg-ivory pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Menu">
        {items.map((i) => (
          <Link key={i.href} href={i.href}
            className={`flex-1 py-3 text-center text-xs ${ativo(pathname, i) ? 'text-ink font-medium' : 'text-ash'}`}>
            {i.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
