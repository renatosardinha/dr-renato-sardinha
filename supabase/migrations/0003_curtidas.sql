-- Curtidas nos posts do feed.
-- Cada paciente só enxerga e altera as PRÓPRIAS curtidas; o total de cada post vem de uma função segura.

create table if not exists public.post_likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, patient_id)
);

alter table public.post_likes enable row level security;

create policy likes_select on public.post_likes for select to authenticated
  using (patient_id = public.current_patient_id() or public.is_admin());
create policy likes_insert on public.post_likes for insert to authenticated
  with check (patient_id = public.current_patient_id());
create policy likes_delete on public.post_likes for delete to authenticated
  using (patient_id = public.current_patient_id());

grant select, insert, delete on public.post_likes to authenticated;

-- Total de curtidas por post publicado + se o usuário atual curtiu (não revela quem curtiu).
create or replace function public.curtidas_posts()
returns table (post_id uuid, total bigint, curti boolean)
language sql stable security definer set search_path = public as $$
  select l.post_id,
         count(*)::bigint,
         coalesce(bool_or(l.patient_id = public.current_patient_id()), false)
  from public.post_likes l
  join public.posts p on p.id = l.post_id and p.publicado
  where public.current_patient_id() is not null or public.is_admin()
  group by l.post_id;
$$;

revoke all on function public.curtidas_posts() from public, anon;
grant execute on function public.curtidas_posts() to authenticated;
