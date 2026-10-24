'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown, Pause, Play } from 'lucide-react';
import { site } from '@/lib/content';
import { Em } from '@/components/Em';

export function Hero() {
  const { hero } = site;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  const headlineLines = hero.headline.split('\n');
  const temVideo = Boolean(hero.video);

  // Vídeo de fundo: sem som, em loop; não toca sozinho para quem pediu menos movimento
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.pause();
      setTocando(false);
      return;
    }
    v.play().then(() => setTocando(true)).catch(() => setTocando(false));
  }, []);

  function alternar() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setTocando(true); } else { v.pause(); setTocando(false); }
  }

  return (
    <>
      <section id="top" className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink text-ivory">
        {/* Fundo: vídeo (sem som) ou, enquanto não há vídeo, um degradê quente */}
        {temVideo ? (
          <video
            ref={videoRef}
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            src={hero.video}
            poster={hero.image}
            autoPlay muted loop playsInline preload="metadata"
            aria-hidden="true" tabIndex={-1}
          />
        ) : (
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-umber via-ink to-ink" />
        )}
        {/* Camada escura quente (~60%) para o texto claro ficar legível */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/40" />

        <div className="container-editorial w-full pb-14 pt-36 md:pb-20 md:pt-44">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="mb-10 flex flex-col gap-3 md:mb-14 md:flex-row md:items-center md:justify-between"
          >
            <span className="eyebrow !text-clay">{hero.eyebrow}</span>
            <span className="font-mono text-xs tracking-widest text-clay/80">
              № 01 · {site.contact.city.toUpperCase()} · {new Date().getFullYear()}
            </span>
          </motion.div>

          <div className="grid items-end gap-10 md:grid-cols-12 md:gap-12">
            <div className={temVideo ? 'md:col-span-10 lg:col-span-9' : 'md:col-span-7 lg:col-span-8'}>
              <h1 className="font-display text-display-lg text-pretty tracking-tightest display-treatment leading-[0.98] !text-ivory">
                {headlineLines.map((line, lineIdx) => (
                  <span key={lineIdx} className="block overflow-hidden pb-[0.08em]">
                    <motion.span
                      initial={{ y: '110%' }}
                      animate={{ y: '0%' }}
                      transition={{ duration: 1.2, delay: 0.5 + lineIdx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      className="block"
                    >
                      <Em text={line} />
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="mt-10 max-w-prose text-pretty text-lg font-light leading-relaxed text-ivory/80 md:text-xl">
                  {hero.subheadline}
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <a href={hero.primaryCta.href} target="_blank" rel="noopener noreferrer" className="btn-primary group">
                    {hero.primaryCta.label}
                    <ArrowRight strokeWidth={1.4} className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                  </a>
                  <a href={hero.secondaryCta.href} className="btn-ghost-light">{hero.secondaryCta.label}</a>
                </div>
              </motion.div>
            </div>

            {/* Sem vídeo: retrato em cartão arredondado. Com vídeo, o próprio fundo é o retrato. */}
            {!temVideo && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
                className="md:col-span-5 lg:col-span-4"
              >
                <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl md:ml-auto">
                  <Image src={hero.image} alt={hero.imageAlt} fill priority sizes="(max-width: 768px) 80vw, 30vw" className="object-cover" />
                </div>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.6 }}
            className="mt-14 flex items-center gap-3 text-ivory/60"
          >
            <span className="font-mono text-xs uppercase tracking-widest">Continue</span>
            <ArrowDown strokeWidth={1} className="h-4 w-4 animate-bounce" style={{ animationDuration: '2.5s' }} />
          </motion.div>
        </div>

        {temVideo && (
          <button
            onClick={alternar}
            aria-label={tocando ? 'Pausar vídeo de fundo' : 'Reproduzir vídeo de fundo'}
            className="absolute bottom-28 right-6 flex h-11 w-11 items-center justify-center rounded-full border border-ivory/40 text-ivory transition-colors hover:bg-ivory/10 md:bottom-10 md:right-28"
          >
            {tocando ? <Pause strokeWidth={1.4} className="h-4 w-4" /> : <Play strokeWidth={1.4} className="h-4 w-4" />}
          </button>
        )}
      </section>

      {/* Credenciais — Conformidade CFM 2.336/2023: pós-graduação lato sensu anunciada
          como formação, sem uso do termo "Especialização" (reservado a RQE) */}
      <section className="bg-bone py-14 md:py-16">
        <div className="container-editorial">
          <dl className="grid grid-cols-2 gap-y-10 md:grid-cols-4 md:divide-x md:divide-mist">
            {[
              ['Formação',      'Medicina · UNIUBE'],
              ['Pós-graduação', 'Nutrologia Esportiva'],
              ['Em curso',      'Psiquiatria · PBE'],
              ['Modalidade',    'Presencial · Online'],
            ].map(([label, value]) => (
              <div key={label} className="md:px-8 md:first:pl-0">
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-2 font-display text-lg text-ink md:text-xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
