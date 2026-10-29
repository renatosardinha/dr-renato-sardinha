'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true }, // o banco só libera e-mails cadastrados pela clínica
    });
    setCarregando(false);
    if (error) {
      setErro('Não foi possível enviar o código. Confira o e-mail cadastrado na clínica.');
      return;
    }
    setEtapa('codigo');
  }

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: codigo.trim(),
      type: 'email',
    });
    setCarregando(false);
    if (error) {
      setErro('Código inválido ou expirado. Tente novamente.');
      return;
    }
    // Confere se o navegador guardou o login (alguns bloqueiam cookies, como abas privativas e navegadores
    // de dentro de outros aplicativos). Sem isso a pessoa voltaria para esta tela sem entender o motivo.
    const { data } = await supabase.auth.getSession();
    const cookiesOk = typeof navigator !== 'undefined' && navigator.cookieEnabled && document.cookie.includes('sb-');
    if (!data.session || !cookiesOk) {
      setErro('O código está certo, mas este navegador não guardou o seu login. Abra o endereço direto no Safari ou no Chrome (fora do WhatsApp, Instagram ou e-mail), sem aba privativa, e tente de novo.');
      return;
    }
    // Navegação completa: garante que o servidor já receba o login ao abrir o app.
    window.location.assign('/paciente');
  }

  const input = 'w-full rounded-lg border border-mist bg-ivory px-4 py-3 text-base outline-none focus:border-terracotta-deep';
  const botao = 'w-full rounded-full bg-ink py-3 text-[15px] font-semibold text-ivory disabled:opacity-50';

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-mark.svg" alt="Clínica RS" className="h-14 w-14 rounded-full border border-mist bg-ivory p-1" />
      <h1 className="mt-4 font-display text-3xl">Área do paciente</h1>
      <p className="mt-3 text-graphite">
        {etapa === 'email'
          ? 'Informe o e-mail cadastrado na clínica. Enviaremos um código de acesso.'
          : `Enviamos um código para ${email}. Digite-o abaixo.`}
      </p>

      {etapa === 'email' ? (
        <form onSubmit={enviarCodigo} className="mt-8 space-y-4">
          <input type="email" required autoComplete="email" placeholder="seu@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          <button disabled={carregando} className={botao}>
            {carregando ? 'Enviando…' : 'Receber código'}
          </button>
        </form>
      ) : (
        <form onSubmit={confirmar} className="mt-8 space-y-4">
          <input inputMode="numeric" autoComplete="one-time-code" required placeholder="Código"
            value={codigo} onChange={(e) => setCodigo(e.target.value)} className={input} />
          <button disabled={carregando} className={botao}>
            {carregando ? 'Verificando…' : 'Entrar'}
          </button>
          <button type="button" onClick={() => { setEtapa('email'); setCodigo(''); }}
            className="w-full text-sm text-ash underline">Usar outro e-mail</button>
        </form>
      )}
      {erro && <p className="mt-4 text-sm text-terracotta" role="alert">{erro}</p>}
    </main>
  );
}
