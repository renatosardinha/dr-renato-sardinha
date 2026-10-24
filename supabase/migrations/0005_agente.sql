-- Agente de dúvidas: histórico das conversas (visível ao próprio paciente e ao administrador).
-- Retenção: 90 dias (função de limpeza abaixo; o app a chama de tempos em tempos).

create table if not exists public.agent_messages (
  id         uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  pergunta   text not null,
  resposta   text not null,
  urgente    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists agent_messages_paciente_idx on public.agent_messages (patient_id, created_at desc);

alter table public.agent_messages enable row level security;

create policy agent_select on public.agent_messages for select to authenticated
  using (patient_id = public.current_patient_id() or public.is_admin());
create policy agent_insert on public.agent_messages for insert to authenticated
  with check (patient_id = public.current_patient_id());
create policy agent_delete on public.agent_messages for delete to authenticated
  using (public.is_admin());

grant select, insert, delete on public.agent_messages to authenticated;

-- Apaga conversas com mais de 90 dias.
create or replace function public.limpar_conversas_antigas()
returns void
language sql security definer set search_path = public as $$
  delete from public.agent_messages where created_at < now() - interval '90 days';
$$;

revoke all on function public.limpar_conversas_antigas() from public, anon;
grant execute on function public.limpar_conversas_antigas() to authenticated;
