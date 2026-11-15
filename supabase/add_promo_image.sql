-- Permite colocar uma foto/banner na promoção, além do texto.
-- Rode no SQL Editor do Supabase.

alter table store_settings add column if not exists promo_image_url text;
