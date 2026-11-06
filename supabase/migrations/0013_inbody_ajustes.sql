-- Ajustes da integração InBody (depois do primeiro teste real).
-- 1) O aparelho reenvia o resultado quando acha que falhou, e como o LookinBody não manda e-mail,
--    o mesmo exame entrava duas vezes. Agora o exame é reconhecido pelo e-mail OU pelo ID do LookinBody.
-- 2) Quando o paciente é vinculado uma vez pelo painel, os próximos exames com o mesmo ID do LookinBody
--    entram direto no paciente, sem precisar de e-mail.
-- Rode este arquivo inteiro no SQL Editor do Supabase.

-- Remove duplicados já recebidos (mantém o mais antigo; se um deles já estiver vinculado, mantém o vinculado).
delete from public.bioimpedancias b
using (
  select id,
         row_number() over (
           partition by coalesce(email_recebido, id_recebido), medido_em
           order by (patient_id is not null) desc, created_at asc
         ) as ordem
  from public.bioimpedancias
  where coalesce(email_recebido, id_recebido) is not null
) d
where b.id = d.id and d.ordem > 1;

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
  v_id text := nullif(left(trim(p_id), 120), '');
  v_medido timestamptz := coalesce(p_medido_em, now());
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

  -- Mesmo exame reenviado (mesmo e-mail ou mesmo ID, na mesma data e hora): não duplica.
  if (v_email is not null or v_id is not null) and exists (
    select 1 from public.bioimpedancias
    where coalesce(email_recebido, id_recebido) = coalesce(v_email, v_id) and medido_em = v_medido
  ) then
    return 'duplicado';
  end if;

  -- 1º: paciente pelo e-mail de acesso ao app.
  if v_email is not null then
    select id into v_pid from public.patients where email = v_email and ativo limit 1;
  end if;
  -- 2º: paciente já vinculado antes a este mesmo ID do LookinBody.
  if v_pid is null and v_id is not null then
    select patient_id into v_pid from public.bioimpedancias
    where id_recebido = v_id and patient_id is not null
    order by created_at desc limit 1;
  end if;

  insert into public.bioimpedancias
    (patient_id, email_recebido, id_recebido, medido_em, peso, massa_muscular, massa_gordura, percentual_gordura, dados_brutos)
  values
    (v_pid, v_email, v_id, v_medido, p_peso, p_massa_muscular, p_massa_gordura, p_percentual_gordura, p_bruto)
  on conflict (email_recebido, medido_em) do nothing
  returning id into v_novo;

  if v_novo is null then return 'duplicado'; end if;
  return case when v_pid is null then 'pendente' else 'ok' end;
end;
$$;

revoke all on function public.receber_bioimpedancia(text, text, text, timestamptz, numeric, numeric, numeric, numeric, jsonb) from public;
grant execute on function public.receber_bioimpedancia(text, text, text, timestamptz, numeric, numeric, numeric, numeric, jsonb) to anon, authenticated;
