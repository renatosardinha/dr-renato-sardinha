-- Medida caseira opcional em cada item do plano (ex.: "1 unidade", "2 fatias").
-- Rode este arquivo inteiro no SQL Editor do Supabase.
alter table public.plan_items add column if not exists medida text
  check (medida is null or char_length(medida) <= 60);
