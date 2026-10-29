-- Envio de arquivos pelo paciente (exames, receitas, bioimpedância, outros).
-- O arquivo vai direto do celular para o Storage; aqui ficam só os dados e a segurança.
-- Rode este arquivo inteiro no SQL Editor do Supabase.

-- ============ Tabela ============
create table if not exists public.patient_uploads (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  tipo text not null default 'exame' check (tipo in ('exame','receita','bioimpedancia','outro')),
  nome_arquivo text not null,
  observacao text,
  storage_path text not null,        -- <patient_id>/enviados/<uuid>.<ext> no bucket "documentos"
  tamanho integer,
  visto_em timestamptz,              -- null = a clínica ainda não abriu (selo "novo")
  created_at timestamptz not null default now()
);
create index if not exists patient_uploads_patient_idx on public.patient_uploads(patient_id, created_at desc);
create index if not exists patient_uploads_novos_idx on public.patient_uploads(patient_id) where visto_em is null;

alter table public.patient_uploads enable row level security;

-- Paciente vê só os dele; a clínica vê todos.
create policy uploads_select on public.patient_uploads for select to authenticated
  using (public.is_admin() or patient_id = public.current_patient_id());

-- Paciente só registra envio para si mesmo e dentro da própria pasta.
create policy uploads_insert on public.patient_uploads for insert to authenticated
  with check (
    patient_id = public.current_patient_id()
    and storage_path like (patient_id::text || '/enviados/%')
  );

-- Só a clínica altera (marcar como visto) ou apaga.
create policy uploads_admin_update on public.patient_uploads for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy uploads_admin_delete on public.patient_uploads for delete to authenticated
  using (public.is_admin());

grant select, insert, update, delete on public.patient_uploads to authenticated;

-- ============ Limite diário (10 envios em 24 h por paciente) ============
create or replace function public.enviados_hoje() returns integer
language sql stable security definer set search_path = public, storage as $$
  select count(*)::int from storage.objects
  where bucket_id = 'documentos'
    and (storage.foldername(name))[1] = public.current_patient_id()::text
    and (storage.foldername(name))[2] = 'enviados'
    and created_at > now() - interval '24 hours';
$$;

-- ============ Armazenamento ============
-- O paciente só consegue ADICIONAR arquivo na própria pasta "enviados" (não apaga, não troca).
-- A leitura continua pela regra que já existe (cada paciente vê só a própria pasta).
create policy documentos_paciente_envia on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documentos'
    and public.current_patient_id() is not null
    and (storage.foldername(name))[1] = public.current_patient_id()::text
    and (storage.foldername(name))[2] = 'enviados'
    and public.enviados_hoje() < 10
  );

-- Limite de 10 MB e tipos aceitos (PDF, JPG, PNG) no bucket de documentos.
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['application/pdf','image/jpeg','image/png']
where id = 'documentos';
