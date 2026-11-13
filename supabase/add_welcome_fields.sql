-- Adiciona tempo de entrega estimado e mensagem de boas-vindas.
-- Rode no SQL Editor do Supabase.

alter table store_settings add column if not exists delivery_time_estimate text;
alter table store_settings add column if not exists welcome_message text;

update store_settings set
  delivery_time_estimate = coalesce(delivery_time_estimate, '40-60 min'),
  welcome_message = coalesce(
    welcome_message,
    'Seja bem-vindo(a)! Trabalhamos com espetinhos na brasa, baião cremoso e combos especiais. Pedidos sujeitos à disponibilidade.'
  )
where id = 1;
