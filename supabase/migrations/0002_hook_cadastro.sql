-- Só permite criar acesso (login) para e-mails que a clínica cadastrou em "patients" ou "admins".
-- Depois de rodar, ativar em: Authentication > Auth Hooks > Before User Created > Postgres function.
create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(event -> 'user' ->> 'email');
begin
  if exists (select 1 from public.patients where email = v_email and ativo)
     or exists (select 1 from public.admins where email = v_email) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'error', jsonb_build_object(
      'message', 'E-mail não cadastrado na clínica.',
      'http_code', 403
    )
  );
end;
$$;

grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_before_user_created(jsonb) from authenticated, anon, public;
