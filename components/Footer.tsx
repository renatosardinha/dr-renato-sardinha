import { site } from '@/lib/content';
import { Logo } from './Logo';

export function Footer() {
  const { footer } = site;

  return (
    <footer className="bg-bone border-t border-mist py-20 md:py-24">
      <div className="container-editorial">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16">
          {/* Coluna da marca */}
          <div className="md:col-span-5">
            <Logo className="h-7 w-auto text-ink" />
            <p className="mt-6 font-display text-xl text-graphite italic max-w-sm leading-relaxed">
              {footer.tagline}
            </p>
          </div>

          {/* Colunas de links */}
          {footer.columns.map((col) => (
            <div key={col.title} className="md:col-span-2 lg:col-span-2">
              <h3 className="eyebrow mb-6">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.href.startsWith('http') ? '_blank' : undefined}
                      rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-graphite hover:text-ink transition-colors duration-500"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-20 pt-10 border-t border-mist">
          <p className="text-xs text-ash leading-relaxed max-w-3xl">
            {footer.disclaimer}
          </p>
        </div>

        {/* Rodapé legal */}
        <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-ash">
          <p className="font-mono tracking-widest">
            © {new Date().getFullYear()} · {footer.legal}
          </p>
          <p className="font-mono tracking-widest">
            Construído com critério.
          </p>
        </div>
      </div>
    </footer>
  );
}
