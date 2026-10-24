-- Painel de uso do app (só administrador): quem acessa, quando, e quem ainda não entrou.
-- Guarda no máximo 1 registro por paciente por dia (sem horário e sem o que a pessoa viu).

create table if not exists public.patient_activity (
  patient_id uuid not null references public.patients(id) on delete cascade,
  dia        date not null,
  primary key (patient_id, dia)
);
alter table public.patient_activity enable row level security; -- sem políticas: só as funções abaixo acessam

create or replace function public.registrar_acesso()
returns void
language plpgsql security definer set search_path = public as $$
declare pid uuid := public.current_patient_id();
begin
  if pid is null then return; end if;
  insert into public.patient_activity (patient_id, dia)
  values (pid, (now() at time zone 'America/Sao_Paulo')::date)
  on conflict do nothing;
end;
$$;

create or replace function public.painel_uso()
returns table (total_ativos bigint, ativos_7d bigint, ativos_30d bigint, nunca_acessaram bigint)
language sql stable security definer set search_path = public as $$
  with hoje as (select (now() at time zone 'America/Sao_Paulo')::date as d)
  select
    (select count(*) from public.patients where ativo),
    (select count(distinct a.patient_id) from public.patient_activity a
       join public.patients p on p.id = a.patient_id and p.ativo, hoje where a.dia >= hoje.d - 6),
    (select count(distinct a.patient_id) from public.patient_activity a
       join public.patients p on p.id = a.patient_id and p.ativo, hoje where a.dia >= hoje.d - 29),
    (select count(*) from public.patients p where p.ativo
       and not exists (select 1 from public.patient_activity a where a.patient_id = p.id))
  where public.is_admin();
$$;

create or replace function public.uso_por_dia(p_dias integer default 14)
returns table (dia date, pacientes bigint)
language sql stable security definer set search_path = public as $$
  select g::date, count(a.patient_id)
  from generate_series(
         (now() at time zone 'America/Sao_Paulo')::date - (greatest(p_dias, 1) - 1),
         (now() at time zone 'America/Sao_Paulo')::date, interval '1 day') g
  left join public.patient_activity a on a.dia = g::date
  where public.is_admin()
  group by g order by g;
$$;

create or replace function public.pacientes_inativos(p_dias integer default 30)
returns table (id uuid, nome text, celular text, ultimo_acesso date)
language sql stable security definer set search_path = public as $$
  select p.id, p.nome, p.celular, max(a.dia)
  from public.patients p
  left join public.patient_activity a on a.patient_id = p.id
  where public.is_admin() and p.ativo
  group by p.id, p.nome, p.celular
  having max(a.dia) is null or max(a.dia) < (now() at time zone 'America/Sao_Paulo')::date - p_dias
  order by max(a.dia) nulls first, p.nome
  limit 200;
$$;

revoke all on function public.registrar_acesso() from public, anon;
revoke all on function public.painel_uso() from public, anon;
revoke all on function public.uso_por_dia(integer) from public, anon;
revoke all on function public.pacientes_inativos(integer) from public, anon;
grant execute on function public.registrar_acesso() to authenticated;
grant execute on function public.painel_uso() to authenticated;
grant execute on function public.uso_por_dia(integer) to authenticated;
grant execute on function public.pacientes_inativos(integer) to authenticated;
