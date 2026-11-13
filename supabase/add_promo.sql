-- Adiciona campos de promoção configurável (ex: "Quarta do Baião").
-- Rode no SQL Editor do Supabase.

alter table store_settings add column if not exists promo_active boolean not null default false;
alter table store_settings add column if not exists promo_title text;
alter table store_settings add column if not exists promo_description text;
