-- Correção de segurança: a policy original permitia listar TODOS os pedidos
-- publicamente. Agora só o admin autenticado pode listar/ler pedidos; o
-- acompanhamento do cliente (link /pedido/[id]) passa a usar a service_role
-- key no servidor, que não depende de RLS.

drop policy if exists "orders_public_select_by_id" on orders;
create policy "orders_admin_select" on orders for select using (auth.role() = 'authenticated');

drop policy if exists "order_items_public_select" on order_items;
create policy "order_items_admin_select" on order_items for select using (auth.role() = 'authenticated');
