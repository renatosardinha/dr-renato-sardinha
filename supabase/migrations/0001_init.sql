-- Clínica RS — área do paciente. Estrutura inicial.
-- Rodar no Supabase: SQL Editor > New query > colar > Run.

-- ============ Tabelas ============
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique check (email = lower(email)),
  celular text,
  gestaods_id bigint unique,
  ativo boolean not null default true,
  consentimento_em timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  corpo text,
  tipo text not null default 'texto' check (tipo in ('texto','imagem','video')),
  midia_path text,          -- imagem no Storage (bucket "feed")
  video_url text,           -- vídeo no serviço de vídeo (a definir)
  publicado boolean not null default false,
  publicado_em timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  tipo text not null default 'bioimpedancia' check (tipo in ('bioimpedancia','receita','exame','outro')),
  titulo text not null,
  storage_path text not null,   -- caminho: <patient_id>/arquivo.pdf no bucket "documentos"
  data_documento date,
  created_at timestamptz not null default now()
);
create index if not exists documents_patient_idx on public.documents(patient_id, created_at desc);

-- ============ Funções de identificação ============
-- O e-mail vem do login (código confirmado por e-mail), não pode ser forjado.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = lower(auth.jwt() ->> 'email'));
$$;

create or replace function public.current_patient_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.patients
  where email = lower(auth.jwt() ->> 'email') and ativo
  limit 1;
$$;

-- ============ Segurança por linha (RLS) ============
alter table public.admins    enable row level security;
alter table public.patients  enable row level security;
alter table public.posts     enable row level security;
alter table public.documents enable row level security;

-- admins: ninguém lê pela API (só as funções acima)
-- patients
create policy patients_select on public.patients for select to authenticated
  using (public.is_admin() or id = public.current_patient_id());
create policy patients_admin_write on public.patients for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- posts: qualquer paciente ativo vê o publicado; admin vê e edita tudo
create policy posts_select on public.posts for select to authenticated
  using (public.is_admin() or (publicado and public.current_patient_id() is not null));
create policy posts_admin_write on public.posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- documents: cada paciente só os dele
create policy documents_select on public.documents for select to authenticated
  using (public.is_admin() or patient_id = public.current_patient_id());
create policy documents_admin_write on public.documents for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Permissões básicas (as regras acima é que limitam o que cada um vê)
grant usage on schema public to authenticated;
grant select on public.patients, public.posts, public.documents to authenticated;
grant insert, update, delete on public.patients, public.posts, public.documents to authenticated;

-- ============ Armazenamento privado ============
insert into storage.buckets (id, name, public) values ('documentos','documentos', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('feed','feed', false)
  on conflict (id) do nothing;

create policy documentos_select on storage.objects for select to authenticated
  using (bucket_id = 'documentos'
         and (public.is_admin() or (storage.foldername(name))[1] = public.current_patient_id()::text));
create policy documentos_admin_write on storage.objects for all to authenticated
  using (bucket_id = 'documentos' and public.is_admin())
  with check (bucket_id = 'documentos' and public.is_admin());

create policy feed_select on storage.objects for select to authenticated
  using (bucket_id = 'feed' and (public.is_admin() or public.current_patient_id() is not null));
create policy feed_admin_write on storage.objects for all to authenticated
  using (bucket_id = 'feed' and public.is_admin())
  with check (bucket_id = 'feed' and public.is_admin());

-- ============ Primeiro administrador e paciente de teste ============
insert into public.admins (email) values ('renatosardinhamed@gmail.com') on conflict do nothing;
