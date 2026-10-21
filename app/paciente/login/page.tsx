'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
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
      options: { shouldCreateUser: false }, // só quem a clínica cadastrou entra
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
    router.replace('/paciente');
    router.refresh();
  }

  const input = 'w-full border border-mist bg-ivory px-4 py-3 text-base outline-none focus:border-terracotta';
  const botao = 'w-full bg-ink text-ivory py-3 text-sm tracking-wide disabled:opacity-50';

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-eyebrow uppercase tracking-editorial text-terracotta">Clínica RS</p>
      <h1 className="mt-3 font-display text-display-sm">Área do paciente</h1>
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
