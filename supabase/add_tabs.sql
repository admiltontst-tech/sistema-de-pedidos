-- Mesas e comandas: pedidos feitos pelo garçom, presencialmente, que acumulam
-- numa "conta aberta" até o garçom fechar. Rode no SQL Editor do Supabase.

create table if not exists tabs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('mesa', 'comanda')),
  table_number int,
  label text not null,
  status text not null default 'aberta' check (status in ('aberta', 'fechada')),
  payment_method text check (payment_method in ('pix', 'dinheiro', 'cartao')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

alter table orders add column if not exists tab_id uuid references tabs(id) on delete set null;

-- Pedidos de mesa/comanda usam o nome da mesa/comanda como "cliente" e não
-- têm forma de pagamento por rodada (isso é definido só no fechamento da
-- conta, lá na tabela tabs).
alter table orders alter column payment_method drop not null;

alter table orders drop constraint if exists orders_delivery_type_check;
alter table orders add constraint orders_delivery_type_check
  check (delivery_type in ('delivery', 'pickup', 'local'));

alter table tabs enable row level security;
create policy "tabs_admin_all" on tabs for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Número de mesas do salão, configurável pelo admin.
alter table store_settings add column if not exists table_count int not null default 12;
