import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { lerCorpo, lerInBody } from '@/lib/inbody';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 150_000;

/**
 * Recebe os resultados do LookinBody 120 (Integração de dados InBody > API da web).
 * No LookinBody: URL do servidor = https://SEU-DOMINIO/api/inbody, TLS 1.2, e o cabeçalho x-chave = PALAVRA-SECRETA.
 * A chave é conferida no banco (função receber_bioimpedancia). O paciente é achado pelo e-mail.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const chave = url.searchParams.get('chave')
    ?? req.headers.get('x-chave')
    ?? req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    ?? '';
  if (!chave) return NextResponse.json({ ok: false, erro: 'Chave ausente.' }, { status: 401 });

  const bruto = await req.text();
  if (!bruto.trim()) return NextResponse.json({ ok: false, erro: 'Corpo vazio.' }, { status: 400 });
  if (bruto.length > MAX_BYTES) return NextResponse.json({ ok: false, erro: 'Envio grande demais.' }, { status: 413 });

  const dados = lerCorpo(bruto, req.headers.get('content-type') ?? '');
  const l = lerInBody(dados);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc('receber_bioimpedancia', {
    p_chave: chave,
    p_email: l.email,
    p_id: l.id,
    p_medido_em: l.medidoEm,
    p_peso: l.peso,
    p_massa_muscular: l.massaMuscular,
    p_massa_gordura: l.massaGordura,
    p_percentual_gordura: l.percentualGordura,
    p_bruto: typeof dados === 'object' && dados !== null ? dados : { valor: dados },
  });

  if (error) {
    console.error('inbody: falha ao gravar', error.message);
    return NextResponse.json({ ok: false, erro: 'Falha ao gravar.' }, { status: 500 });
  }
  if (data === 'chave_invalida') return NextResponse.json({ ok: false, erro: 'Chave inválida.' }, { status: 401 });
  if (data === 'grande_demais') return NextResponse.json({ ok: false, erro: 'Envio grande demais.' }, { status: 413 });

  // ok = gravado no paciente; pendente = e-mail não encontrado (a clínica vincula no painel); duplicado = já recebido.
  return NextResponse.json({ ok: true, status: data });
}

export function GET() {
  return NextResponse.json({ ok: true, servico: 'inbody' });
}
