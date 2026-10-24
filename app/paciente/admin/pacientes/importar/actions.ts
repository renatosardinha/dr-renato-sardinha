'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Resultado = {
  erro?: string;
  modo?: 'previa' | 'importar';
  total: number;
  novos: number;
  atualizados: number;
  iguais: number;
  semEmail: number;
  repetidos: { nome: string; email: string }[];
  /** Pacientes com e-mail repetido na planilha (ficam de fora). */
  falhas: number;
} | null;

const MAX_BYTES = 4 * 1024 * 1024;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Leitor simples de CSV (aspas, vírgula ou ponto e vírgula). */
function lerCsv(texto: string): string[][] {
  const primeira = texto.split(/\r?\n/, 1)[0] ?? '';
  const sep = (primeira.match(/;/g)?.length ?? 0) >= (primeira.match(/,/g)?.length ?? 0) ? ';' : ',';
  const linhas: string[][] = [];
  let campo = '', linha: string[] = [], aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === sep) { linha.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      linha.push(campo); campo = '';
      if (linha.some((x) => x.trim())) linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  linha.push(campo);
  if (linha.some((x) => x.trim())) linhas.push(linha);
  return linhas;
}

function decodificar(buf: ArrayBuffer): string {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch { return new TextDecoder('windows-1252').decode(buf); }
}

export async function importarPlanilha(_anterior: Resultado, formData: FormData): Promise<Resultado> {
  const supabase = createClient();
  const { data: admin } = await supabase.rpc('is_admin');
  if (!admin) redirect('/paciente');

  const modo = formData.get('modo') === 'importar' ? 'importar' : 'previa';
  const vazio = { total: 0, novos: 0, atualizados: 0, iguais: 0, semEmail: 0, repetidos: [], falhas: 0 };
  const arquivo = formData.get('arquivo');
  if (!(arquivo instanceof File) || arquivo.size === 0) return { ...vazio, erro: 'Selecione o arquivo .csv.' };
  if (arquivo.size > MAX_BYTES) return { ...vazio, erro: 'Arquivo acima de 4 MB.' };
  if (!/\.csv$/i.test(arquivo.name)) return { ...vazio, erro: 'Envie um arquivo .csv (no Excel: Arquivo → Salvar como → CSV).' };

  const linhas = lerCsv(decodificar(await arquivo.arrayBuffer()));
  if (linhas.length < 2) return { ...vazio, erro: 'A planilha está vazia.' };
  const cab = linhas[0].map(norm);
  const col = (...nomes: string[]) => cab.findIndex((c) => nomes.includes(c));
  const iNome = col('nome completo', 'nome');
  const iEmail = col('email', 'e-mail');
  const iCel = col('celular');
  const iTel = col('telefone');
  if (iNome < 0 || iEmail < 0) return { ...vazio, erro: 'Não achei as colunas "Nome completo" e "Email" na primeira linha.' };

  const vistos = new Map<string, { nome: string; celular: string | null }>();
  const repetidos: { nome: string; email: string }[] = [];
  let semEmail = 0;
  for (const l of linhas.slice(1)) {
    const nome = (l[iNome] ?? '').trim();
    const email = (l[iEmail] ?? '').trim().toLowerCase();
    if (!nome) continue;
    if (!EMAIL.test(email)) { semEmail++; continue; }
    const celular = ((iCel >= 0 ? l[iCel] : '') || (iTel >= 0 ? l[iTel] : '') || '').trim() || null;
    if (vistos.has(email)) { repetidos.push({ nome, email }); continue; }
    vistos.set(email, { nome, celular });
  }

  // Quem já existe
  const emails = Array.from(vistos.keys());
  const existentes = new Map<string, { nome: string; celular: string | null }>();
  for (let i = 0; i < emails.length; i += 100) {
    const { data, error } = await supabase.from('patients').select('email, nome, celular').in('email', emails.slice(i, i + 100));
    if (error) return { ...vazio, erro: error.message };
    for (const p of data ?? []) existentes.set(p.email, { nome: p.nome, celular: p.celular });
  }

  const novos = emails.filter((e) => !existentes.has(e));
  const mudaram = emails.filter((e) => {
    const a = existentes.get(e); const b = vistos.get(e)!;
    return a && (a.nome !== b.nome || (b.celular && a.celular !== b.celular));
  });
  const resumo = {
    total: vistos.size, novos: novos.length, atualizados: mudaram.length,
    iguais: vistos.size - novos.length - mudaram.length, semEmail, repetidos: repetidos.slice(0, 100), falhas: repetidos.length,
  };

  if (modo === 'previa') return { ...resumo, modo };

  for (let i = 0; i < novos.length; i += 200) {
    const lote = novos.slice(i, i + 200).map((email) => ({ email, nome: vistos.get(email)!.nome, celular: vistos.get(email)!.celular }));
    const { error } = await supabase.from('patients').insert(lote);
    if (error) return { ...resumo, modo, erro: `Parou no lote ${i / 200 + 1}: ${error.message}. O que já foi salvo continua salvo; é seguro enviar de novo.` };
  }
  for (const email of mudaram) {
    const v = vistos.get(email)!;
    const { error } = await supabase.from('patients').update({ nome: v.nome, ...(v.celular ? { celular: v.celular } : {}) }).eq('email', email);
    if (error) return { ...resumo, modo, erro: error.message };
  }
  return { ...resumo, modo };
}
