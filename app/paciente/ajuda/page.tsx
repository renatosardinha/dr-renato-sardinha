import Link from 'next/link';

export const metadata = { title: 'Como entrar e instalar o app | Clínica RS' };

const passo = 'cartao-vidro rounded-[22px] p-5';

export default function Ajuda() {
  return (
    <main className="mx-auto max-w-[600px] px-4 py-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-mark.svg" alt="Clínica RS" className="h-12 w-12 rounded-full border border-white/80 bg-white/60 p-1" />
      <h1 className="mt-4 font-display text-3xl">Como entrar e instalar o app</h1>
      <p className="mt-2 text-graphite">
        Endereço do app: <b>renatosardinha.com.br/paciente</b>. Siga os passos abaixo. Leva poucos minutos.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="font-display text-xl">1. Entrar pela primeira vez</h2>
        <ol className={`${passo} list-decimal space-y-2 pl-9 text-graphite`}>
          <li>Abra <b>renatosardinha.com.br/paciente</b> no <b>Safari</b> (iPhone) ou no <b>Chrome</b> (Android). Evite abrir por dentro do WhatsApp, do Instagram ou do e-mail.</li>
          <li>Digite o <b>e-mail que você informou à clínica</b> e toque em “Receber código”.</li>
          <li>Abra o seu e-mail, copie o código de acesso e digite no app. Se não achar, olhe também o <b>spam</b> ou a caixa de promoções.</li>
          <li>Toque em “Entrar”. Use sempre o código mais recente: ao pedir um código novo, o anterior deixa de valer.</li>
        </ol>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-display text-xl">2. Colocar o app na tela inicial</h2>
        <p className="text-sm text-ash">Assim ele abre como um aplicativo, com o ícone da clínica, e você não precisa digitar o endereço de novo.</p>

        <div className={passo}>
          <h3 className="font-medium">iPhone (use o Safari)</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-6 text-graphite">
            <li>Com o app aberto no Safari, toque no botão <b>Compartilhar</b> (um quadrado com uma seta para cima). Ele fica na barra de baixo ou dentro do menu de três pontinhos.</li>
            <li>Role a lista e toque em <b>“Adicionar à Tela de Início”</b>.</li>
            <li>Se aparecer a opção “Abrir como app da Web”, deixe ligada. Toque em <b>“Adicionar”</b>.</li>
            <li>O ícone da Clínica RS aparece na tela inicial. Abra por ele.</li>
          </ol>
        </div>

        <div className={passo}>
          <h3 className="font-medium">Android (use o Chrome)</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-6 text-graphite">
            <li>Com o app aberto no Chrome, toque nos <b>três pontinhos</b> no canto superior direito.</li>
            <li>Toque em <b>“Instalar app”</b> (em alguns celulares aparece como <b>“Adicionar à tela inicial”</b>).</li>
            <li>Confirme em <b>“Instalar”</b> ou “Adicionar”.</li>
            <li>O ícone da Clínica RS aparece na tela inicial. Abra por ele.</li>
          </ol>
          <p className="mt-3 text-sm text-ash">Se você usa o navegador da Samsung: toque no menu (três linhas), depois em “Adicionar página a” e em “Tela inicial”.</p>
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="font-display text-xl">Se algo não funcionar</h2>
        <ul className={`${passo} list-disc space-y-2 pl-9 text-graphite`}>
          <li><b>O código não chegou:</b> confira o e-mail digitado, olhe o spam e espere 1 a 2 minutos antes de pedir outro.</li>
          <li><b>O app volta para a tela do e-mail depois do código:</b> abra o endereço direto no Safari ou no Chrome, fora de outros aplicativos e sem aba privativa, e tente de novo.</li>
          <li><b>“Não foi possível enviar o código”:</b> o e-mail pode estar diferente do cadastrado na clínica. Fale com a recepção.</li>
        </ul>
      </section>

      <p className="mt-8 text-center">
        <Link href="/paciente/login" className="aba-ativa inline-flex min-h-[48px] items-center rounded-full px-6 text-base font-medium">Ir para o login</Link>
      </p>
    </main>
  );
}
