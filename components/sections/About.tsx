import { Reveal } from '@/components/Reveal';
import { site } from '@/lib/content';

export function About() {
  const { about } = site;

  return (
    <section id="sobre" className="relative py-section bg-ivory">
      <div className="container-editorial">
        <div className="grid md:grid-cols-12 gap-12 md:gap-20">
          {/* Coluna lateral — eyebrow + título */}
          <div className="md:col-span-5">
            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <span className="font-mono text-xs text-ash tracking-widest">02</span>
                <span className="eyebrow">{about.eyebrow}</span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="font-display text-display-lg text-pretty display-treatment">
                {about.title}
              </h2>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-10 text-lg text-graphite leading-relaxed">
                {about.lead}
              </p>
            </Reveal>

            {/* Credenciais — formato ficha técnica editorial */}
            <Reveal delay={0.3}>
              <dl className="mt-12 space-y-4 pt-8 border-t border-mist">
                {about.credentials.map((c) => (
                  <div key={c.label} className="flex items-baseline justify-between gap-4">
                    <dt className="eyebrow">{c.label}</dt>
                    <dd className="font-display text-sm md:text-base text-ink text-right">{c.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* Coluna principal — parágrafos */}
          <div className="md:col-span-7 md:pt-16">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.15 + i * 0.1}>
                <p className="text-graphite text-lg md:text-xl leading-[1.7] mb-8 last:mb-0 max-w-prose">
                  {p}
                </p>
              </Reveal>
            ))}

            {/* Assinatura editorial */}
            <Reveal delay={0.5}>
              <div className="mt-16 pt-8 border-t border-mist flex items-center justify-between">
                <span className="font-display text-lg italic text-umber">— Dr. Renato Sardinha</span>
                <span className="font-mono text-xs text-ash tracking-widest">CRM-SP</span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
