import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = { title: 'Política de Privacidade' };

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-40 pb-section">
        <div className="container-editorial max-w-3xl">
          <span className="eyebrow">Institucional</span>
          <h1 className="mt-6 font-display text-display-md">Política de Privacidade</h1>

          <div className="mt-12 space-y-6 text-graphite leading-relaxed">
            <p>Esta política descreve como tratamos as informações coletadas por meio deste site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>

            <h2 className="font-display text-2xl text-ink mt-12">1. Dados coletados</h2>
            <p>Coletamos apenas informações fornecidas voluntariamente — nome, contato e mensagens enviadas pelos canais oficiais (WhatsApp, e-mail, formulários). Dados de navegação podem ser coletados para fins estatísticos e de melhoria do site.</p>

            <h2 className="font-display text-2xl text-ink mt-12">2. Finalidade</h2>
            <p>Os dados são utilizados exclusivamente para responder solicitações, organizar agendamentos e prestar o serviço médico contratado, respeitando o sigilo profissional.</p>

            <h2 className="font-display text-2xl text-ink mt-12">3. Direitos do titular</h2>
            <p>Você pode, a qualquer momento, solicitar acesso, correção ou exclusão dos seus dados, bem como informações sobre o tratamento realizado. Para isso, entre em contato pelos canais oficiais.</p>

            <h2 className="font-display text-2xl text-ink mt-12">4. Sigilo médico</h2>
            <p>Informações clínicas obtidas em consulta são protegidas pelo sigilo profissional, conforme determina o Código de Ética Médica e a legislação aplicável.</p>

            <p className="text-sm text-ash mt-16">Última atualização: {new Date().toLocaleDateString('pt-BR')}.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
