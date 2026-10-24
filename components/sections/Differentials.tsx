import { Reveal } from '@/components/Reveal';
import { SectionHeader } from '@/components/SectionHeader';
import { site } from '@/lib/content';

export function Differentials() {
  const { differentials } = site;

  return (
    <section className="relative py-section">
      <div className="container-editorial">
        <SectionHeader
          index="05"
          eyebrow={differentials.eyebrow}
          title={differentials.title}
        />

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {differentials.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <article className="rounded-3xl border border-mist/70 bg-ivory p-10 md:p-12 h-full hover:bg-sand/40 transition-colors duration-700">
                <div className="w-8 h-px bg-terracotta mb-6" />
                <h3 className="font-display text-xl md:text-2xl text-ink mb-3 display-treatment">
                  {item.title}
                </h3>
                <p className="text-graphite text-sm md:text-base leading-relaxed">
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
