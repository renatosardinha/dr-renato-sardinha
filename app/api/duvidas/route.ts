import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SISTEMA, triagem } from '@/lib/agente/regras';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MODELO = process.env.AGENTE_MODELO || 'claude-haiku-5-5';
const LIMITE_DIARIO = 20;
const MAX_CHARS = 1000;

type Turno = { role: 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  if (process.env.AGENTE_ATIVO !== '1' || !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ erro: 'O assistente ainda não está disponível.' }, { status: 503 });
  }

  const supabase = createClient();
  const { data: pid } = await supabase.rpc('current_patient_id');
  if (!pid) return NextResponse.json({ erro: 'Acesso restrito a pacientes.' }, { status: 401 });

  let corpo: { mensagem?: unknown; historico?: unknown };
  try { corpo = await req.json(); } catch { return NextResponse.json({ erro: 'Pedido inválido.' }, { status: 400 }); }
  const mensagem = typeof corpo.mensagem === 'string' ? corpo.mensagem.trim() : '';
  if (!mensagem || mensagem.length > MAX_CHARS) {
    return NextResponse.json({ erro: `Escreva uma pergunta de até ${MAX_CHARS} caracteres.` }, { status: 400 });
  }

  // Limite diário por paciente
  const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await supabase.from('agent_messages').select('id', { count: 'exact', head: true })
    .eq('patient_id', pid).gte('created_at', desde);
  if ((count ?? 0) >= LIMITE_DIARIO) {
    return NextResponse.json({ erro: 'Você atingiu o limite de perguntas de hoje. Volte amanhã ou fale com a clínica.' }, { status: 429 });
  }

  const salvar = async (resposta: string, urgente: boolean) => {
    await supabase.from('agent_messages').insert({ patient_id: pid, pergunta: mensagem, resposta, urgente });
    if (Math.random() < 0.02) await supabase.rpc('limpar_conversas_antigas'); // limpeza ocasional (90 dias)
  };

  // Triagem: urgências e risco são tratados com resposta fixa, sem consultar o modelo.
  const t = triagem(mensagem);
  if (t) {
    await salvar(t.resposta, true);
    return NextResponse.json({ resposta: t.resposta, urgente: true });
  }

  const historico: Turno[] = Array.isArray(corpo.historico)
    ? (corpo.historico as unknown[])
        .filter((h): h is Turno => !!h && typeof h === 'object'
          && ((h as Turno).role === 'user' || (h as Turno).role === 'assistant')
          && typeof (h as Turno).content === 'string')
        .slice(-6)
        .map((h) => ({ role: h.role, content: h.content.slice(0, 2000) }))
    : [];
  // A primeira mensagem enviada ao modelo precisa ser do usuário.
  while (historico.length && historico[0].role !== 'user') historico.shift();

  let resp: Response;
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': (process.env.ANTHROPIC_API_KEY ?? '').replace(/\s+/g, ''),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 700,
        temperature: 0.3,
        system: [{ type: 'text', text: SISTEMA, cache_control: { type: 'ephemeral' } }],
        messages: [...historico, { role: 'user', content: mensagem }],
      }),
    });
  } catch (e) {
    console.error('agente: falha ao chamar a API', e instanceof Error ? e.message : e);
    return NextResponse.json({ erro: 'Não consegui responder agora. Tente de novo ou fale com a clínica.' }, { status: 502 });
  }
  if (!resp.ok) {
    console.error('agente: erro da API', resp.status, (await resp.text()).slice(0, 300));
    return NextResponse.json({ erro: 'Não consegui responder agora. Tente de novo ou fale com a clínica.' }, { status: 502 });
  }

  const dados = await resp.json();
  const resposta: string = (dados.content ?? [])
    .filter((c: { type: string }) => c.type === 'text')
    .map((c: { text: string }) => c.text).join('\n').trim();
  if (!resposta) return NextResponse.json({ erro: 'Não consegui responder agora. Fale com a clínica.' }, { status: 502 });

  await salvar(resposta, false);
  return NextResponse.json({ resposta });
}
