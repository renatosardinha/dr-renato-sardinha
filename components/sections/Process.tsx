import { Reveal } from '@/components/Reveal';
import { SectionHeader } from '@/components/SectionHeader';
import { site } from '@/lib/content';

export function Process() {
  const { process } = site;

  return (
    <section id="acompanhamento" className="relative py-section">
      <div className="container-editorial">
        <SectionHeader
          index="03"
          eyebrow={process.eyebrow}
          title={process.title}
          lead={process.lead}
        />

        {/* Etapas — grid editorial 2x2 com numerais display */}
        <div className="grid md:grid-cols-2 gap-px bg-mist border border-mist">
          {process.steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              <article className="group bg-bone p-10 md:p-14 h-full transition-colors duration-700 hover:bg-ivory">
                <div className="flex items-start justify-between mb-8">
                  <span className="font-display text-display-md text-clay group-hover:text-umber transition-colors duration-700">
                    {step.n}
                  </span>
                  <span className="font-mono text-xs text-ash tracking-widest mt-3">ETAPA</span>
                </div>

                <h3 className="font-display text-2xl md:text-3xl text-ink mb-4 display-treatment">
                  {step.title}
                </h3>
                <p className="text-graphite leading-relaxed text-pretty">
                  {step.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Modalidades */}
        <Reveal delay={0.4}>
          <div className="mt-16 md:mt-20 flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center">
            <span className="eyebrow">Modalidades</span>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              {process.modalities.map((m) => (
                <div key={m.label} className="flex items-baseline gap-3">
                  <span className="w-1 h-1 rounded-full bg-terracotta" />
                  <span className="font-display text-lg text-ink">{m.label}</span>
                  <span className="text-sm text-ash">— {m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
