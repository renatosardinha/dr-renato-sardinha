-- Aba "Indicações": contatos de farmácias, suplementos, profissionais e serviços (gerenciada pelo admin).

create table if not exists public.indicacoes (
  id         uuid primary key default gen_random_uuid(),
  categoria  text not null check (categoria in ('farmacia','suplementos','profissionais','servicos','outros')),
  nome       text not null,
  descricao  text,
  whatsapp   text,
  instagram  text,
  site       text,
  cupom      text,
  ordem      integer not null default 0,
  ativo      boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.indicacoes enable row level security;

-- Pacientes ativos veem só os itens ativos; admin vê e edita tudo.
create policy indicacoes_select on public.indicacoes for select to authenticated
  using (public.is_admin() or (ativo and public.current_patient_id() is not null));
create policy indicacoes_admin_write on public.indicacoes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on public.indicacoes to authenticated;
grant insert, update, delete on public.indicacoes to authenticated;
