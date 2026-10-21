'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function exigirAdmin() {
  const supabase = createClient();
  const { data } = await supabase.rpc('is_admin');
  if (!data) redirect('/paciente');
  return supabase;
}

function voltar(tipo: 'ok' | 'erro', msg: string): never {
  redirect(`/paciente/admin?${tipo}=${encodeURIComponent(msg)}`);
}

export async function criarPaciente(formData: FormData) {
  const supabase = await exigirAdmin();
  const nome = String(formData.get('nome') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const celular = String(formData.get('celular') ?? '').trim() || null;
  const consentiu = formData.get('consentimento') === 'on';
  if (!nome || !email) voltar('erro', 'Informe nome e e-mail.');

  // O acesso de login é criado automaticamente no 1º login (liberado pelo banco só para e-mails cadastrados).

  const { error } = await supabase.from('patients').insert({
    nome, email, celular, consentimento_em: consentiu ? new Date().toISOString() : null,
  });
  if (error) voltar('erro', error.code === '23505' ? 'Já existe paciente com esse e-mail.' : error.message);

  revalidatePath('/paciente/admin');
  voltar('ok', `Paciente ${nome} cadastrado.`);
}

const MAX_BYTES = 4 * 1024 * 1024;
const TIPOS_OK = ['application/pdf', 'image/jpeg', 'image/png'];

export async function enviarDocumento(formData: FormData) {
  const supabase = await exigirAdmin();
  const patient_id = String(formData.get('patient_id') ?? '');
  const tipo = String(formData.get('tipo') ?? 'bioimpedancia');
  const titulo = String(formData.get('titulo') ?? '').trim();
  const data_documento = String(formData.get('data_documento') ?? '') || null;
  const arquivo = formData.get('arquivo');

  if (!patient_id || !titulo) voltar('erro', 'Escolha o paciente e dê um título.');
  if (!(arquivo instanceof File) || arquivo.size === 0) voltar('erro', 'Selecione um arquivo.');
  const file = arquivo as File;
  if (!TIPOS_OK.includes(file.type)) voltar('erro', 'Envie PDF, JPG ou PNG.');
  if (file.size > MAX_BYTES) voltar('erro', 'Arquivo acima de 4 MB.');

  const nomeSeguro = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storage_path = `${patient_id}/${Date.now()}-${nomeSeguro}`;

  const { error: upErr } = await supabase.storage.from('documentos')
    .upload(storage_path, file, { contentType: file.type });
  if (upErr) voltar('erro', 'Falha no envio: ' + upErr.message);

  const { error } = await supabase.from('documents')
    .insert({ patient_id, tipo, titulo, storage_path, data_documento });
  if (error) voltar('erro', error.message);

  revalidatePath('/paciente/admin');
  voltar('ok', 'Documento enviado.');
}

const TIPOS_IMG = ['image/jpeg', 'image/png', 'image/webp'];

export async function publicarPost(formData: FormData) {
  const supabase = await exigirAdmin();
  const titulo = String(formData.get('titulo') ?? '').trim();
  const corpo = String(formData.get('corpo') ?? '').trim() || null;
  const imagem = formData.get('imagem');
  if (!titulo) voltar('erro', 'Informe o título.');

  let midia_path: string | null = null;
  if (imagem instanceof File && imagem.size > 0) {
    if (!TIPOS_IMG.includes(imagem.type)) voltar('erro', 'Imagem deve ser JPG, PNG ou WebP.');
    if (imagem.size > MAX_BYTES) voltar('erro', 'Imagem acima de 4 MB.');
    midia_path = `posts/${Date.now()}-${imagem.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('feed')
      .upload(midia_path, imagem, { contentType: imagem.type });
    if (upErr) voltar('erro', 'Falha ao enviar a imagem: ' + upErr.message);
  }

  const { error } = await supabase.from('posts').insert({
    titulo, corpo, publicado: true, midia_path, tipo: midia_path ? 'imagem' : 'texto',
  });
  if (error) voltar('erro', error.message);

  revalidatePath('/paciente');
  voltar('ok', 'Post publicado no feed.');
}

export async function removerPost(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = String(formData.get('id') ?? '');
  const { data: post } = await supabase.from('posts').select('midia_path').eq('id', id).maybeSingle();
  if (post?.midia_path) await supabase.storage.from('feed').remove([post.midia_path]);
  await supabase.from('posts').delete().eq('id', id);
  revalidatePath('/paciente');
  voltar('ok', 'Post removido.');
}
