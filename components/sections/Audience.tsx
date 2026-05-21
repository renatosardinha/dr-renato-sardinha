import { Reveal } from '@/components/Reveal';
import { SectionHeader } from '@/components/SectionHeader';
import { site } from '@/lib/content';

export function Audience() {
  const { audience } = site;

  return (
    <section id="para-quem" className="relative py-section bg-sand/40">
      <div className="container-editorial">
        <SectionHeader
          index="04"
          eyebrow={audience.eyebrow}
          title={audience.title}
          lead={audience.lead}
        />

        <div className="grid md:grid-cols-2 gap-12 md:gap-x-16 md:gap-y-20">
          {audience.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <article className="group">
                <div className="flex items-baseline gap-4 mb-5">
                  <span className="font-mono text-xs text-ash tracking-widest">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 h-px bg-mist origin-left transition-transform duration-700 group-hover:scale-x-110" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-ink mb-4 display-treatment">
                  {item.title}
                </h3>
                <p className="text-graphite leading-relaxed max-w-prose">
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
