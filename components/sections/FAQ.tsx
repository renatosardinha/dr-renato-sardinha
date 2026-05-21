'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { SectionHeader } from '@/components/SectionHeader';
import { site } from '@/lib/content';

export function FAQ() {
  const { faq } = site;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-section">
      <div className="container-editorial">
        <SectionHeader index="07" eyebrow={faq.eyebrow} title={faq.title} />

        <div className="max-w-4xl border-t border-mist">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.04}>
                <div className="border-b border-mist">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-start justify-between gap-6 py-8 md:py-10 text-left group"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-6 flex-1">
                      <span className="font-mono text-xs text-ash tracking-widest mt-2">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-display text-xl md:text-2xl text-ink group-hover:text-umber transition-colors duration-500 display-treatment">
                        {item.q}
                      </h3>
                    </div>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-2 shrink-0"
                    >
                      <Plus strokeWidth={1} className="w-6 h-6 text-ink" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pl-0 md:pl-14 pb-8 md:pb-10 text-graphite leading-relaxed max-w-prose">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
