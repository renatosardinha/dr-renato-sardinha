'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { site } from '@/lib/content';
import { Logo } from './Logo';
import clsx from 'clsx';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className={clsx(
          'fixed top-0 inset-x-0 z-50 transition-all duration-700 ease-editorial',
          scrolled
            ? 'bg-bone/85 backdrop-blur-md border-b border-mist/50'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="container-editorial flex items-center justify-between h-20 md:h-24">
          <a href="#top" className="block text-ink" aria-label={site.brand.name}>
            <Logo className="h-6 md:h-7 w-auto" />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {site.nav.slice(0, -1).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-graphite hover:text-ink transition-colors duration-500"
              >
                {item.label}
              </a>
            ))}
            <a
              href={site.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm tracking-wider uppercase text-ink border-b border-ink pb-0.5 hover:opacity-60 transition-opacity duration-500"
            >
              Agendar
            </a>
          </nav>

          {/* Mobile trigger */}
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-ink"
            aria-label="Abrir menu"
          >
            <Menu strokeWidth={1.2} className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[60] bg-bone"
          >
            <div className="container-editorial flex items-center justify-between h-20">
              <Logo className="h-6 w-auto text-ink" />
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="text-ink">
                <X strokeWidth={1.2} className="w-6 h-6" />
              </button>
            </div>

            <nav className="container-editorial mt-12 flex flex-col gap-8">
              {site.nav.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-4xl text-ink border-b border-mist pb-4"
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            <div className="container-editorial mt-16 flex flex-col gap-3 text-sm text-graphite">
              <a href={site.contact.whatsappLink} className="editorial-link">{site.contact.whatsapp}</a>
              <a href={site.contact.instagramLink} className="editorial-link">{site.contact.instagram}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
