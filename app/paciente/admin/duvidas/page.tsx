import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Linha = { id: string; pergunta: string; resposta: string; urgente: boolean; created_at: string; patients: { nome: string } | null };

export default async function ConversasAgente() {
  const supabase = createClient();
  const { data, error } = await supabase.from('agent_messages')
    .select('id, pergunta, resposta, urgente, created_at, patients(nome)')
    .order('created_at', { ascending: false }).limit(100);
  const linhas = (data ?? []) as unknown as Linha[];

  return (
    <section>
      <h1 className="font-display text-display-sm">Dúvidas (agente)</h1>
      <p className="mt-2 text-sm text-graphite">
        Últimas perguntas feitas ao assistente e as respostas. Use para revisar a qualidade e ajustar a base. As conversas são
        apagadas após 90 dias. Marcadas em vermelho: orientações de urgência.
      </p>
      {error && <p className="mt-4 text-sm text-terracotta">Rode a migração 0005 no Supabase para ativar esta página.</p>}
      <ul className="mt-4 space-y-3">
        {linhas.map((l) => (
          <li key={l.id} className={`rounded-lg border bg-ivory p-4 text-sm ${l.urgente ? 'border-terracotta' : 'border-mist'}`}>
            <p className="text-ash">
              {l.patients?.nome ?? 'Paciente'} · {new Date(l.created_at).toLocaleString('pt-BR')}
              {l.urgente ? ' · urgência' : ''}
            </p>
            <p className="mt-2 font-semibold">{l.pergunta}</p>
            <p className="mt-1 whitespace-pre-line text-graphite">{l.resposta}</p>
          </li>
        ))}
        {!error && linhas.length === 0 && <li className="text-ash">Nenhuma conversa ainda.</li>}
      </ul>
    </section>
  );
}
