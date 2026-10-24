'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { videoEmbedUrl } from '@/lib/video';

const BASE = '/paciente/admin';

async function exigirAdmin() {
  const supabase = createClient();
  const { data } = await supabase.rpc('is_admin');
  if (!data) redirect('/paciente');
  return supabase;
}

/** Só aceita voltar para páginas do próprio painel. */
function destino(formData: FormData, padrao: string) {
  const r = String(formData.get('retorno') ?? '');
  return r.startsWith(BASE) && !r.includes('//') && !r.includes('..') && !r.includes('?') ? r : padrao;
}

function voltar(base: string, tipo: 'ok' | 'erro', msg: string): never {
  redirect(`${base}?${tipo}=${encodeURIComponent(msg)}`);
}

const MAX_BYTES = 4 * 1024 * 1024;
const TIPOS_DOC = ['application/pdf', 'image/jpeg', 'image/png'];
const TIPOS_IMG = ['image/jpeg', 'image/png', 'image/webp'];
const nomeSeguro = (n: string) => n.replace(/[^a-zA-Z0-9._-]/g, '_');

// ---------- Pacientes ----------
export async function criarPaciente(formData: FormData) {
  const supabase = await exigirAdmin();
  const base = `${BASE}/pacientes`;
  const nome = String(formData.get('nome') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const celular = String(formData.get('celular') ?? '').trim() || null;
  const consentiu = formData.get('consentimento') === 'on';
  if (!nome || !email) voltar(base, 'erro', 'Informe nome e e-mail.');

  const { data, error } = await supabase.from('patients').insert({
    nome, email, celular, consentimento_em: consentiu ? new Date().toISOString() : null,
  }).select('id').single();
  if (error) voltar(base, 'erro', error.code === '23505' ? 'Já existe paciente com esse e-mail.' : error.message);

  voltar(`${base}/${data!.id}`, 'ok', `Paciente ${nome} cadastrado.`);
}

export async function atualizarPaciente(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = String(formData.get('id') ?? '');
  const base = `${BASE}/pacientes/${id}`;
  const nome = String(formData.get('nome') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const celular = String(formData.get('celular') ?? '').trim() || null;
  const ativo = formData.get('ativo') === 'on';
  if (!id || !nome || !email) voltar(base, 'erro', 'Informe nome e e-mail.');

  const { error } = await supabase.from('patients').update({ nome, email, celular, ativo }).eq('id', id);
  if (error) voltar(base, 'erro', error.code === '23505' ? 'Já existe outro paciente com esse e-mail.' : error.message);
  voltar(base, 'ok', 'Dados atualizados.');
}

// ---------- Documentos ----------
export async function enviarDocumento(formData: FormData) {
  const supabase = await exigirAdmin();
  const patient_id = String(formData.get('patient_id') ?? '');
  const base = destino(formData, `${BASE}/pacientes/${patient_id}`);
  const tipo = String(formData.get('tipo') ?? 'bioimpedancia');
  const titulo = String(formData.get('titulo') ?? '').trim();
  const data_documento = String(formData.get('data_documento') ?? '') || null;
  const arquivo = formData.get('arquivo');

  if (!patient_id || !titulo) voltar(base, 'erro', 'Dê um título ao documento.');
  if (!(arquivo instanceof File) || arquivo.size === 0) voltar(base, 'erro', 'Selecione um arquivo.');
  const file = arquivo as File;
  if (!TIPOS_DOC.includes(file.type)) voltar(base, 'erro', 'Envie PDF, JPG ou PNG.');
  if (file.size > MAX_BYTES) voltar(base, 'erro', 'Arquivo acima de 4 MB.');

  const storage_path = `${patient_id}/${Date.now()}-${nomeSeguro(file.name)}`;
  const { error: upErr } = await supabase.storage.from('documentos')
    .upload(storage_path, file, { contentType: file.type });
  if (upErr) voltar(base, 'erro', 'Falha no envio: ' + upErr.message);

  const { error } = await supabase.from('documents')
    .insert({ patient_id, tipo, titulo, storage_path, data_documento });
  if (error) voltar(base, 'erro', error.message);
  voltar(base, 'ok', 'Documento enviado.');
}

export async function removerDocumento(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = String(formData.get('id') ?? '');
  const base = destino(formData, `${BASE}/pacientes`);
  const { data: doc } = await supabase.from('documents').select('storage_path').eq('id', id).maybeSingle();
  if (doc?.storage_path) await supabase.storage.from('documentos').remove([doc.storage_path]);
  await supabase.from('documents').delete().eq('id', id);
  voltar(base, 'ok', 'Documento removido.');
}

// ---------- Feed ----------
export async function publicarPost(formData: FormData) {
  const supabase = await exigirAdmin();
  const base = `${BASE}/publicacoes`;
  const titulo = String(formData.get('titulo') ?? '').trim();
  const corpo = String(formData.get('corpo') ?? '').trim() || null;
  const imagem = formData.get('imagem');
  const video_url = String(formData.get('video_url') ?? '').trim() || null;
  if (!titulo) voltar(base, 'erro', 'Informe o título.');
  if (video_url && !videoEmbedUrl(video_url)) {
    voltar(base, 'erro', 'Link de vídeo não reconhecido. Use um link do Vimeo, Bunny Stream ou YouTube.');
  }

  let midia_path: string | null = null;
  if (imagem instanceof File && imagem.size > 0) {
    if (!TIPOS_IMG.includes(imagem.type)) voltar(base, 'erro', 'Imagem deve ser JPG, PNG ou WebP.');
    if (imagem.size > MAX_BYTES) voltar(base, 'erro', 'Imagem acima de 4 MB.');
    midia_path = `posts/${Date.now()}-${nomeSeguro(imagem.name)}`;
    const { error: upErr } = await supabase.storage.from('feed').upload(midia_path, imagem, { contentType: imagem.type });
    if (upErr) voltar(base, 'erro', 'Falha ao enviar a imagem: ' + upErr.message);
  }

  const { error } = await supabase.from('posts').insert({
    titulo, corpo, publicado: true, midia_path, video_url,
    tipo: video_url ? 'video' : midia_path ? 'imagem' : 'texto',
  });
  if (error) voltar(base, 'erro', error.message);
  voltar(base, 'ok', 'Publicado no feed.');
}

export async function atualizarPost(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = String(formData.get('id') ?? '');
  const base = `${BASE}/publicacoes/${id}`;
  const titulo = String(formData.get('titulo') ?? '').trim();
  const corpo = String(formData.get('corpo') ?? '').trim() || null;
  const video_url = String(formData.get('video_url') ?? '').trim() || null;
  const publicado = formData.get('publicado') === 'on';
  const removerImagem = formData.get('remover_imagem') === 'on';
  const imagem = formData.get('imagem');
  if (!id || !titulo) voltar(base, 'erro', 'Informe o título.');
  if (video_url && !videoEmbedUrl(video_url)) {
    voltar(base, 'erro', 'Link de vídeo não reconhecido. Use um link do Vimeo, Bunny Stream ou YouTube.');
  }

  const { data: atual } = await supabase.from('posts').select('midia_path').eq('id', id).maybeSingle();
  let midia_path: string | null = atual?.midia_path ?? null;

  if (imagem instanceof File && imagem.size > 0) {
    if (!TIPOS_IMG.includes(imagem.type)) voltar(base, 'erro', 'Imagem deve ser JPG, PNG ou WebP.');
    if (imagem.size > MAX_BYTES) voltar(base, 'erro', 'Imagem acima de 4 MB.');
    const novo = `posts/${Date.now()}-${nomeSeguro(imagem.name)}`;
    const { error: upErr } = await supabase.storage.from('feed').upload(novo, imagem, { contentType: imagem.type });
    if (upErr) voltar(base, 'erro', 'Falha ao enviar a imagem: ' + upErr.message);
    if (midia_path) await supabase.storage.from('feed').remove([midia_path]);
    midia_path = novo;
  } else if (removerImagem && midia_path) {
    await supabase.storage.from('feed').remove([midia_path]);
    midia_path = null;
  }

  const { error } = await supabase.from('posts').update({
    titulo, corpo, video_url, publicado, midia_path,
    tipo: video_url ? 'video' : midia_path ? 'imagem' : 'texto',
  }).eq('id', id);
  if (error) voltar(base, 'erro', error.message);
  voltar(base, 'ok', 'Publicação atualizada.');
}

export async function removerPost(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = String(formData.get('id') ?? '');
  const { data: post } = await supabase.from('posts').select('midia_path').eq('id', id).maybeSingle();
  if (post?.midia_path) await supabase.storage.from('feed').remove([post.midia_path]);
  await supabase.from('posts').delete().eq('id', id);
  voltar(`${BASE}/publicacoes`, 'ok', 'Publicação removida.');
}
