'use client';

import { useRef, useState } from 'react';
import { Send } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };

/** Transforma endereços https:// em links clicáveis (só https). */
function comLinks(texto: string, chave: string) {
  return texto.split(/(https:\/\/[^\s<>)]+)/g).map((parte, i) =>
    /^https:\/\//.test(parte)
      ? <a key={`${chave}-${i}`} href={parte} target="_blank" rel="noopener noreferrer" className="break-all underline text-terracotta-deep">{parte}</a>
      : parte
  );
}

/**
 * Mostra a resposta do assistente sem os símbolos de Markdown: **negrito** vira negrito de verdade,
 * marcadores de lista viram "•", títulos (#) perdem o símbolo e asteriscos soltos somem.
 * Não interpreta HTML, só texto (seguro).
 */
function formatar(texto: string) {
  const limpo = texto
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[*-]\s+/gm, '• ')
    .replace(/__([^_]+)__/g, '**$1**');
  return limpo.split(/(\*\*[^*]+\*\*)/g).map((parte, i) => {
    if (/^\*\*[^*]+\*\*$/.test(parte)) return <strong key={i}>{comLinks(parte.slice(2, -2), `b${i}`)}</strong>;
    return comLinks(parte.replace(/\*/g, ''), `t${i}`);
  });
}

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
      <p className="cartao-vidro rounded-[18px] px-4 py-3 text-sm text-graphite">
        Este assistente tira dúvidas gerais com base nos materiais da clínica. <strong>Não substitui a consulta</strong> e não
        vê os seus dados. Para sintomas, doses ou urgências, fale com a clínica. As conversas ficam registradas, visíveis só
        para você e para a clínica, e são apagadas após 90 dias.
      </p>

      <div className="mt-4 space-y-3" aria-live="polite">
        {msgs.length === 0 && <p className="text-ash">Pergunte, por exemplo: “Posso trocar o arroz por outro alimento?”</p>}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <p className={`max-w-[85%] whitespace-pre-line rounded-[18px] px-4 py-3 text-[15px] leading-relaxed ${
              m.role === 'user' ? 'bg-ink text-ivory' : 'cartao-vidro text-graphite'}`}>{m.role === 'assistant' ? formatar(m.content) : m.content}</p>
          </div>
        ))}
        {enviando && <p className="text-sm text-ash">Digitando…</p>}
        {erro && <p className="text-sm text-terracotta-deep" role="alert">{erro}</p>}
        <div ref={fim} />
      </div>

      <form onSubmit={enviar} className="vidro sticky bottom-4 mt-4 flex items-center gap-2 rounded-full p-1.5 pl-5">
        <input value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={1000} placeholder="Escreva sua dúvida"
          aria-label="Escreva sua dúvida"
          className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none" />
        <button disabled={enviando || !texto.trim()} aria-label="Enviar"
          className="grad-teal flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-[0_6px_16px_rgba(21,122,116,0.4)] disabled:opacity-40">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
