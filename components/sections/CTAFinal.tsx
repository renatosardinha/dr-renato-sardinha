'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { site } from '@/lib/content';

export function CTAFinal() {
  const { cta } = site;

  return (
    <section id="contato" className="relative py-section bg-ink text-bone overflow-hidden">
      {/* Acento orgânico de luz quente */}
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #A66E4E 0%, transparent 70%)' }}
      />

      <div className="container-editorial relative">
        <Reveal>
          <span className="eyebrow !text-clay">{cta.eyebrow}</span>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-8 font-display text-display-lg !text-bone text-pretty display-treatment max-w-4xl">
            {cta.title.split('\n').map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-10 max-w-prose text-clay text-lg leading-relaxed">
            {cta.lead}
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-14 flex flex-wrap gap-4">
            <a
              href={cta.primary.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-5 bg-bone text-ink font-sans text-sm tracking-wider uppercase transition-all duration-500 ease-editorial hover:bg-sand hover:gap-5"
            >
              {cta.primary.label}
              <ArrowUpRight strokeWidth={1.2} className="w-4 h-4 transition-transform duration-500 group-hover:rotate-45" />
            </a>
            <a
              href={cta.secondary.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-5 border border-bone/30 text-bone font-sans text-sm tracking-wider uppercase transition-all duration-500 hover:border-bone hover:gap-5"
            >
              {cta.secondary.label}
            </a>
          </div>
        </Reveal>

        {/* Linha de contato direta */}
        <Reveal delay={0.4}>
          <div className="mt-24 pt-10 border-t border-bone/15 grid md:grid-cols-3 gap-8">
            <div>
              <span className="eyebrow !text-clay">WhatsApp</span>
              <p className="mt-3 font-display text-lg">{site.contact.whatsapp}</p>
            </div>
            <div>
              <span className="eyebrow !text-clay">Instagram</span>
              <p className="mt-3 font-display text-lg">{site.contact.instagram}</p>
            </div>
            <div>
              <span className="eyebrow !text-clay">Atendimento</span>
              <p className="mt-3 font-display text-lg">{site.contact.city}, {site.contact.state}</p>
              <p className="text-sm text-clay mt-1">{site.contact.address}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
