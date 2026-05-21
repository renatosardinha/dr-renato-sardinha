'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { site } from '@/lib/content';

export function Hero() {
  const { hero } = site;

  // Cada palavra revelada em cascata — efeito editorial signature
  const headlineLines = hero.headline.split('\n');

  return (
    <section id="top" className="relative pt-32 md:pt-40 pb-24 md:pb-32 overflow-hidden">
      {/* Grão sutil de papel */}
      <div className="absolute inset-0 grain pointer-events-none" />

      <div className="container-editorial">
        {/* Eyebrow + meta */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-12 md:mb-20"
        >
          <span className="eyebrow">{hero.eyebrow}</span>
          <span className="font-mono text-xs text-ash tracking-widest">
            № 01 · {site.contact.city.toUpperCase()} · {new Date().getFullYear()}
          </span>
        </motion.div>

        {/* Headline display */}
        <h1 className="font-display text-display-xl text-pretty tracking-tightest display-treatment leading-[0.95]">
          {headlineLines.map((line, lineIdx) => (
            <span key={lineIdx} className="block overflow-hidden">
              <motion.span
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{
                  duration: 1.2,
                  delay: 0.5 + lineIdx * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="block"
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Subheadline + CTAs */}
        <div className="mt-16 md:mt-24 grid md:grid-cols-12 gap-10 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-7 lg:col-span-6"
          >
            <p className="text-lg md:text-xl text-graphite leading-relaxed max-w-prose text-pretty">
              {hero.subheadline}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href={hero.primaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary group"
              >
                {hero.primaryCta.label}
                <ArrowRight strokeWidth={1.2} className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
              </a>
              <a href={hero.secondaryCta.href} className="btn-ghost">
                {hero.secondaryCta.label}
              </a>
            </div>
          </motion.div>

          {/* Painel direito — atributos editoriais */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-5 lg:col-span-5 lg:col-start-8 border-t border-mist pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-10"
          >
            <dl className="grid grid-cols-1 gap-6">
              {[
                ['Formação',     'Medicina · UNIUBE'],
                ['Especialização','Nutrologia · Psiquiatria'],
                ['Modalidade',   'Presencial · Online'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-baseline gap-4 pb-4 border-b border-mist/60 last:border-0">
                  <dt className="eyebrow">{label}</dt>
                  <dd className="font-display text-base md:text-lg text-ink text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.aside>
        </div>

        {/* Indicador de scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.6 }}
          className="mt-24 md:mt-32 flex items-center gap-3 text-ash"
        >
          <span className="font-mono text-xs tracking-widest uppercase">Continue</span>
          <ArrowDown strokeWidth={1} className="w-4 h-4 animate-bounce" style={{ animationDuration: '2.5s' }} />
        </motion.div>
      </div>
    </section>
  );
}
