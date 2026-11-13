-- Adiciona o Instagram da loja.
-- Rode no SQL Editor do Supabase.

alter table store_settings add column if not exists instagram_handle text;

update store_settings set
  instagram_handle = coalesce(instagram_handle, 'espetinhodobeh')
where id = 1;
