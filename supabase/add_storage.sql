-- Cria o bucket de armazenamento pras fotos de produtos enviadas pelo admin.
-- Rode no SQL Editor do Supabase.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Leitura pública das imagens (necessário pro site mostrar as fotos)
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects for select
using (bucket_id = 'product-images');

-- Upload só por admin autenticado
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
on storage.objects for insert
with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
on storage.objects for delete
using (bucket_id = 'product-images' and auth.role() = 'authenticated');
