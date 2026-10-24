-- Aberturas de post por paciente + métricas para o painel admin.
-- O paciente NÃO acessa a tabela diretamente: tudo passa por funções seguras.

create table if not exists public.post_views (
  post_id     uuid not null references public.posts(id) on delete cascade,
  patient_id  uuid not null references public.patients(id) on delete cascade,
  aberturas   integer not null default 1,
  primeira_em timestamptz not null default now(),
  ultima_em   timestamptz not null default now(),
  primary key (post_id, patient_id)
);

alter table public.post_views enable row level security;
-- Sem políticas e sem grants para "authenticated": só as funções abaixo (security definer) leem/escrevem.

-- Registra que o paciente atual abriu um post publicado.
create or replace function public.registrar_abertura(p_post uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare pid uuid := public.current_patient_id();
begin
  if pid is null then return; end if;
  if not exists (select 1 from public.posts where id = p_post and publicado) then return; end if;
  insert into public.post_views (post_id, patient_id) values (p_post, pid)
  on conflict (post_id, patient_id)
  do update set aberturas = public.post_views.aberturas + 1, ultima_em = now();
end;
$$;

-- Métricas por post — só para administradores.
create or replace function public.metricas_posts()
returns table (post_id uuid, curtidas bigint, pacientes bigint, aberturas bigint)
language sql stable security definer set search_path = public as $$
  select p.id,
         (select count(*) from public.post_likes l where l.post_id = p.id),
         (select count(*) from public.post_views v where v.post_id = p.id),
         coalesce((select sum(v.aberturas) from public.post_views v where v.post_id = p.id), 0)::bigint
  from public.posts p
  where public.is_admin();
$$;

revoke all on function public.registrar_abertura(uuid) from public, anon;
revoke all on function public.metricas_posts() from public, anon;
grant execute on function public.registrar_abertura(uuid) to authenticated;
grant execute on function public.metricas_posts() to authenticated;
