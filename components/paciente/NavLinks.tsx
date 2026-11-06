'use client';

import { useEffect, useState } from 'react';
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

import { Home, FileText, MessageCircleQuestion, Store, ClipboardCheck, Utensils, Activity, Menu, X, type LucideIcon } from 'lucide-react';

const ICONES: Record<string, LucideIcon> = { feed: Home, documentos: FileText, duvidas: MessageCircleQuestion, indicacoes: Store, checkin: ClipboardCheck, plano: Utensils, evolucao: Activity };
export type PacienteItem = NavItem & { icone: keyof typeof ICONES };

/** Menu do paciente: faixa lateral só com ícones (computador) e, no celular, um botão Menu que abre a lista de abas. */
export function PacienteTabs({ items }: { items: PacienteItem[] }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const atual = items.find((i) => ativo(pathname, i));
  // Fecha ao trocar de página e ao apertar Esc.
  useEffect(() => { setAberto(false); }, [pathname]);
  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aberto]);
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
        {aberto && <button type="button" aria-label="Fechar menu" className="fixed inset-0 -z-10 cursor-default" onClick={() => setAberto(false)} />}
        <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto} aria-controls="menu-celular"
          className="vidro flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[22px] px-4 text-sm font-medium">
          <span className="flex items-center gap-3">
            {aberto ? <X strokeWidth={1.8} className="h-5 w-5 stroke-ink" /> : <Menu strokeWidth={1.8} className="h-5 w-5 stroke-ink" />}
            Menu
          </span>
          <span className="flex items-center gap-2 text-graphite">
            {atual && (() => { const Icone = ICONES[atual.icone]; return <Icone strokeWidth={1.7} className="h-[18px] w-[18px] stroke-terracotta-deep" />; })()}
            {atual?.label}
          </span>
        </button>
        {aberto && (
          <nav id="menu-celular" className="vidro mt-2 flex flex-col gap-1 rounded-[22px] p-2" aria-label="Menu">
            {items.map((i) => {
              const Icone = ICONES[i.icone];
              const on = ativo(pathname, i);
              return (
                <Link key={i.href} href={i.href} aria-current={on ? 'page' : undefined} onClick={() => setAberto(false)}
                  className={`flex min-h-[48px] items-center gap-3 rounded-[17px] px-4 text-sm font-medium ${on ? 'aba-ativa' : 'text-graphite hover:bg-sand'}`}>
                  <Icone strokeWidth={on ? 1.9 : 1.6} className={`h-5 w-5 ${on ? 'stroke-white' : 'stroke-ink'}`} />
                  {i.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </>
  );
}
