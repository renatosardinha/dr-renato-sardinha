import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = { title: 'Termos de uso' };

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-40 pb-section">
        <div className="container-editorial max-w-3xl">
          <span className="eyebrow">Institucional</span>
          <h1 className="mt-6 font-display text-display-md">Termos de uso</h1>

          <div className="mt-12 space-y-6 text-graphite leading-relaxed">
            <p>Ao navegar neste site, você concorda com os termos descritos abaixo. As informações aqui apresentadas têm caráter informativo e institucional, e não substituem consulta médica presencial.</p>

            <h2 className="font-display text-2xl text-ink mt-12">Conteúdo</h2>
            <p>O conteúdo deste site é de autoria do Dr. Renato Sardinha e não pode ser reproduzido, total ou parcialmente, sem autorização. Resultados clínicos são individuais e dependem de múltiplos fatores.</p>

            <h2 className="font-display text-2xl text-ink mt-12">Limitação de responsabilidade</h2>
            <p>Não nos responsabilizamos por interpretações isoladas do conteúdo apresentado. Qualquer conduta clínica deve ser discutida em consulta médica formal.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
