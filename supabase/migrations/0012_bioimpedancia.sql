-- Bioimpedância InBody 120: resultados recebidos automaticamente do LookinBody (Integração de dados > API da web).
-- O paciente é identificado pelo e-mail cadastrado no LookinBody, que precisa ser o mesmo e-mail de acesso ao app.
-- Rode este arquivo inteiro no SQL Editor do Supabase.

-- ============ Tabela ============
create table if not exists public.bioimpedancias (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade,  -- null = pendente (e-mail não encontrado)
  email_recebido text,                 -- e-mail que veio do LookinBody (só para identificar)
  id_recebido text,                    -- campo ID do LookinBody, guardado para conferência
  medido_em timestamptz not null default now(),
  peso numeric(5,1),                   -- kg
  massa_muscular numeric(5,1),         -- massa muscular esquelética, kg
  massa_gordura numeric(5,1),          -- kg
  percentual_gordura numeric(4,1),     -- %
  dados_brutos jsonb not null,         -- o que o LookinBody enviou, para conferência
  created_at timestamptz not null default now(),
  unique (email_recebido, medido_em)   -- reenvio do mesmo exame não duplica
);
create index if not exists bioimpedancias_patient_idx on public.bioimpedancias(patient_id, medido_em);
create index if not exists bioimpedancias_pendentes_idx on public.bioimpedancias(created_at desc) where patient_id is null;

alter table public.bioimpedancias enable row level security;

-- Paciente vê só os dele; a clínica vê todos.
create policy bioimpedancias_select on public.bioimpedancias for select to authenticated
  using (public.is_admin() or patient_id = public.current_patient_id());
-- Só a clínica vincula a um paciente ou apaga. Ninguém insere pela API: só a função abaixo.
create policy bioimpedancias_admin_update on public.bioimpedancias for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy bioimpedancias_admin_delete on public.bioimpedancias for delete to authenticated
  using (public.is_admin());

grant select, update, delete on public.bioimpedancias to authenticated;

-- ============ Chave da integração ============
-- Guarda só o "hash" da chave. Ninguém lê esta tabela pela API.
create table if not exists public.integracao_chaves (
  nome text primary key,
  hash text not null
);
alter table public.integracao_chaves enable row level security;
revoke all on public.integracao_chaves from anon, authenticated;

-- ============ Recebimento ============
-- Chamada pela rota /api/inbody do site. Confere a chave, acha o paciente pelo e-mail e grava.
create or replace function public.receber_bioimpedancia(
  p_chave text,
  p_email text,
  p_id text,
  p_medido_em timestamptz,
  p_peso numeric,
  p_massa_muscular numeric,
  p_massa_gordura numeric,
  p_percentual_gordura numeric,
  p_bruto jsonb
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_email text := nullif(lower(trim(p_email)), '');
  v_pid uuid;
  v_novo uuid;
begin
  if p_chave is null or not exists (
    select 1 from public.integracao_chaves
    where nome = 'inbody' and hash = encode(sha256(convert_to(p_chave, 'UTF8')), 'hex')
  ) then
    return 'chave_invalida';
  end if;
  if pg_column_size(p_bruto) > 200000 then
    return 'grande_demais';
  end if;

  if v_email is not null then
    select id into v_pid from public.patients where email = v_email and ativo limit 1;
  end if;

  insert into public.bioimpedancias
    (patient_id, email_recebido, id_recebido, medido_em, peso, massa_muscular, massa_gordura, percentual_gordura, dados_brutos)
  values
    (v_pid, v_email, left(p_id, 120), coalesce(p_medido_em, now()),
     p_peso, p_massa_muscular, p_massa_gordura, p_percentual_gordura, p_bruto)
  on conflict (email_recebido, medido_em) do nothing
  returning id into v_novo;

  if v_novo is null then return 'duplicado'; end if;
  return case when v_pid is null then 'pendente' else 'ok' end;
end;
$$;

revoke all on function public.receber_bioimpedancia(text, text, text, timestamptz, numeric, numeric, numeric, numeric, jsonb) from public;
grant execute on function public.receber_bioimpedancia(text, text, text, timestamptz, numeric, numeric, numeric, numeric, jsonb) to anon, authenticated;

-- ============ Depois de rodar ============
-- Cadastre a chave da integração (troque PALAVRA-SECRETA por uma senha longa e aleatória, e guarde-a):
--   insert into public.integracao_chaves (nome, hash)
--   values ('inbody', encode(sha256(convert_to('PALAVRA-SECRETA', 'UTF8')), 'hex'))
--   on conflict (nome) do update set hash = excluded.hash;
-- No LookinBody (Integração de dados > 02 > API da web):
--   URL do servidor: https://SEU-DOMINIO/api/inbody  (TLS 1.2; o campo "Dados InBody (API)" pode ficar como está)
--   Na tabela de chave/valor, acrescente: x-chave = PALAVRA-SECRETA
