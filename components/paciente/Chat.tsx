'use client';

import { useRef, useState } from 'react';
import { Send } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };

export function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const fim = useRef<HTMLDivElement>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const mensagem = texto.trim();
    if (!mensagem || enviando) return;
    setErro(''); setEnviando(true); setTexto('');
    const historico = msgs;
    setMsgs([...historico, { role: 'user', content: mensagem }]);
    try {
      const r = await fetch('/api/duvidas', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mensagem, historico }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro || 'Não consegui responder agora.');
      setMsgs((m) => [...m, { role: 'assistant', content: d.resposta }]);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui responder agora.');
    } finally {
      setEnviando(false);
      setTimeout(() => fim.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  return (
    <div className="mt-4">
      <p className="rounded-lg border border-mist bg-sand px-4 py-3 text-sm text-graphite">
        Este assistente tira dúvidas gerais com base nos materiais da clínica. <strong>Não substitui a consulta</strong> e não
        vê os seus dados. Para sintomas, doses ou urgências, fale com a clínica. As conversas ficam registradas, visíveis só
        para você e para a clínica, e são apagadas após 90 dias.
      </p>

      <div className="mt-4 space-y-3" aria-live="polite">
        {msgs.length === 0 && <p className="text-ash">Pergunte, por exemplo: “Posso trocar o arroz por outro alimento?”</p>}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <p className={`max-w-[85%] whitespace-pre-line rounded-[18px] px-4 py-3 text-[15px] leading-relaxed ${
              m.role === 'user' ? 'bg-ink text-ivory' : 'border border-mist bg-ivory text-graphite'}`}>{m.content}</p>
          </div>
        ))}
        {enviando && <p className="text-sm text-ash">Digitando…</p>}
        {erro && <p className="text-sm text-terracotta-deep" role="alert">{erro}</p>}
        <div ref={fim} />
      </div>

      <form onSubmit={enviar} className="sticky bottom-20 mt-4 flex gap-2 md:bottom-4">
        <input value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={1000} placeholder="Escreva sua dúvida"
          className="min-w-0 flex-1 rounded-full border border-mist bg-ivory px-4 py-3 text-base outline-none focus:border-terracotta-deep" />
        <button disabled={enviando || !texto.trim()} aria-label="Enviar"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-ivory disabled:opacity-40">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
