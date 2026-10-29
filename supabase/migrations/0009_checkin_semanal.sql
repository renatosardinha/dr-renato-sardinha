-- Check-in semanal do paciente (notas de 0 a 10 e dias de treino) e ranking de frequência.
-- Rode este arquivo inteiro no SQL Editor do Supabase.

-- Segunda-feira da semana atual, no horário de Brasília.
create or replace function public.semana_atual() returns date
language sql stable as $$
  select date_trunc('week', now() at time zone 'America/Sao_Paulo')::date;
$$;

-- ============ Tabela ============
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  semana date not null,                       -- segunda-feira da semana respondida
  humor smallint not null check (humor between 0 and 10),
  sono smallint not null check (sono between 0 and 10),
  energia smallint not null check (energia between 0 and 10),
  saciedade smallint not null check (saciedade between 0 and 10),
  plano smallint not null check (plano between 0 and 10),   -- quanto seguiu o plano alimentar
  aerobico smallint not null check (aerobico between 0 and 7),  -- dias na semana
  forca smallint not null check (forca between 0 and 7),        -- dias na semana
  observacao text check (observacao is null or char_length(observacao) <= 300),
  created_at timestamptz not null default now(),
  unique (patient_id, semana)
);
create index if not exists checkins_semana_idx on public.checkins(semana desc);
create index if not exists checkins_created_idx on public.checkins(created_at desc);

alter table public.checkins enable row level security;

-- Paciente vê só os seus; a clínica vê todos.
create policy checkins_select on public.checkins for select to authenticated
  using (public.is_admin() or patient_id = public.current_patient_id());

-- Paciente responde (e pode corrigir) apenas a semana atual, e só para si.
create policy checkins_insert on public.checkins for insert to authenticated
  with check (patient_id = public.current_patient_id() and semana = public.semana_atual());
create policy checkins_update on public.checkins for update to authenticated
  using (patient_id = public.current_patient_id() and semana = public.semana_atual())
  with check (patient_id = public.current_patient_id() and semana = public.semana_atual());

-- A clínica pode apagar (por exemplo, resposta feita por engano).
create policy checkins_admin_delete on public.checkins for delete to authenticated
  using (public.is_admin());

grant select, insert, update, delete on public.checkins to authenticated;

-- ============ Participação no ranking ============
alter table public.patients add column if not exists ranking_participa boolean not null default true;

create or replace function public.definir_ranking(p_participa boolean) returns void
language plpgsql security definer set search_path = public as $$
declare pid uuid := public.current_patient_id();
begin
  if pid is null then return; end if;
  update public.patients set ranking_participa = p_participa where id = pid;
end;
$$;

-- ============ Posição do paciente (sem mostrar nomes) ============
-- Média de dias por semana nas últimas 4 semanas, entre pacientes ativos que participam do ranking.
create or replace function public.meu_ranking()
returns table (item text, minha_media numeric, participantes integer, acima integer)
language plpgsql stable security definer set search_path = public as $$
declare pid uuid := public.current_patient_id();
begin
  if pid is null then return; end if;
  if not exists (select 1 from public.patients where id = pid and ranking_participa) then return; end if;
  return query
  with medias as (
    select c.patient_id, avg(c.aerobico)::numeric as aer, avg(c.forca)::numeric as frc
    from public.checkins c
    join public.patients p on p.id = c.patient_id and p.ativo and p.ranking_participa
    where c.semana >= public.semana_atual() - 21
    group by c.patient_id
  )
  select 'aerobico'::text, round(m.aer, 1), (select count(*)::int from medias),
         (select count(*)::int from medias x where x.aer > m.aer)
  from medias m where m.patient_id = pid
  union all
  select 'forca'::text, round(m.frc, 1), (select count(*)::int from medias),
         (select count(*)::int from medias x where x.frc > m.frc)
  from medias m where m.patient_id = pid;
end;
$$;

revoke all on function public.definir_ranking(boolean) from public, anon;
revoke all on function public.meu_ranking() from public, anon;
grant execute on function public.definir_ranking(boolean) to authenticated;
grant execute on function public.meu_ranking() to authenticated;
