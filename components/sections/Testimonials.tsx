'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { site } from '@/lib/content';

export function Testimonials() {
  const { testimonials } = site;
  const [index, setIndex] = useState(0);

  const total = testimonials.items.length;
  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  const current = testimonials.items[index];

  return (
    <section id="depoimentos" className="relative py-section bg-ivory">
      <div className="container-editorial">
        <Reveal>
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-xs text-ash tracking-widest">06</span>
            <span className="eyebrow">{testimonials.eyebrow}</span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="font-display text-display-md max-w-3xl text-pretty display-treatment">
            {testimonials.title}
          </h2>
        </Reveal>

        <div className="mt-20 md:mt-28 relative">
          {/* Aspas decorativas */}
          <div aria-hidden className="absolute -top-12 left-0 font-display text-[12rem] leading-none text-clay/30 select-none">
            “
          </div>

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-4xl"
            >
              <p className="font-display text-2xl md:text-4xl lg:text-5xl leading-[1.25] text-ink text-pretty display-treatment">
                {current.quote}
              </p>

              <footer className="mt-10 flex items-center gap-4">
                <span className="w-10 h-px bg-ink" />
                <div>
                  <cite className="not-italic font-display text-lg text-ink">{current.author}</cite>
                  <span className="block text-sm text-ash mt-1">{current.role}</span>
                </div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>

          {/* Controles */}
          <div className="mt-16 flex items-center justify-between gap-6 pt-8 border-t border-mist">
            <span className="font-mono text-xs text-ash tracking-widest">
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Depoimento anterior"
                className="w-12 h-12 border border-mist hover:border-ink flex items-center justify-center text-ink transition-colors duration-500"
              >
                <ArrowLeft strokeWidth={1.2} className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                aria-label="Próximo depoimento"
                className="w-12 h-12 border border-mist hover:border-ink flex items-center justify-center text-ink transition-colors duration-500"
              >
                <ArrowRight strokeWidth={1.2} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
