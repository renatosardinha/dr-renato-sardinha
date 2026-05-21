import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center">
        <div className="container-editorial">
          <span className="eyebrow">Página não encontrada</span>
          <h1 className="mt-8 font-display text-display-lg">404</h1>
          <p className="mt-6 text-graphite max-w-prose">A página que você procurava não está disponível.</p>
          <Link href="/" className="mt-10 inline-flex btn-primary">Voltar ao início</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
