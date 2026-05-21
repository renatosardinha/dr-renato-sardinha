import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { site } from '@/lib/content';

export const metadata = { title: 'LGPD' };

export default function LGPDPage() {
  return (
    <>
      <Navbar />
      <main className="pt-40 pb-section">
        <div className="container-editorial max-w-3xl">
          <span className="eyebrow">Institucional</span>
          <h1 className="mt-6 font-display text-display-md">LGPD</h1>

          <div className="mt-12 space-y-6 text-graphite leading-relaxed">
            <p>Atuamos em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), tratando seus dados pessoais com critério, finalidade legítima e segurança técnica adequada.</p>

            <h2 className="font-display text-2xl text-ink mt-12">Encarregado pelo tratamento de dados</h2>
            <p>Para exercer seus direitos como titular ou esclarecer dúvidas sobre o tratamento dos seus dados:</p>
            <p>E-mail: <a className="editorial-link" href={`mailto:${site.contact.email}`}>{site.contact.email}</a></p>
            <p>WhatsApp: <a className="editorial-link" href={site.contact.whatsappLink}>{site.contact.whatsapp}</a></p>

            <h2 className="font-display text-2xl text-ink mt-12">Direitos garantidos</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Confirmação da existência de tratamento;</li>
              <li>Acesso aos dados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Portabilidade e revogação de consentimento.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
