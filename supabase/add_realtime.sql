-- Habilita atualizações em tempo real na tabela de pedidos,
-- necessário pro alerta sonoro de "novo pedido" no painel admin.
-- Rode no SQL Editor do Supabase.

alter publication supabase_realtime add table orders;
