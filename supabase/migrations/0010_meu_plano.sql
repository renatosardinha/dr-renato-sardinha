-- "Meu plano": plano alimentar do paciente em forma de dados (refeição, alimento, gramas),
-- para o paciente ver no app e trocar itens pela calculadora. A clínica cadastra pelo painel.
-- Rode este arquivo inteiro no SQL Editor do Supabase.

create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  refeicao text not null check (char_length(refeicao) between 1 and 40),
  ordem integer not null default 0,
  nome text not null check (char_length(nome) between 1 and 120),
  alimento_id text,                                  -- id na tabela de trocas (c:... ou t:...); vazio = item livre, sem troca
  quantidade_g numeric check (quantidade_g is null or (quantidade_g > 0 and quantidade_g <= 5000)),
  created_at timestamptz not null default now()
);
create index if not exists plan_items_patient_idx on public.plan_items(patient_id, ordem);

alter table public.plan_items enable row level security;

-- Paciente vê só o plano dele; a clínica vê e altera todos.
create policy plan_items_select on public.plan_items for select to authenticated
  using (public.is_admin() or patient_id = public.current_patient_id());
create policy plan_items_admin_write on public.plan_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.plan_items to authenticated;
