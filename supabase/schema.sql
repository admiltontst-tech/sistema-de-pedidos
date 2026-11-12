-- Espetinho do Beh — schema do sistema de pedidos
-- Rode este script inteiro no SQL Editor do Supabase (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- ========== TABELAS ==========

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  description text,
  price_cents int not null,
  image_url text,
  badge text,
  available boolean not null default true,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists product_option_groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  type text not null check (type in ('single', 'multiple')),
  required boolean not null default false,
  max_select int,
  sort_order int not null default 0
);

create table if not exists product_options (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references product_option_groups(id) on delete cascade,
  label text not null,
  price_delta_cents int not null default 0,
  sort_order int not null default 0
);

create table if not exists store_settings (
  id int primary key default 1,
  name text not null default 'Espetinho do Beh',
  tagline text default 'Sabor que une pessoas',
  whatsapp_phone text not null default '5585994495915',
  address text default 'Rua Ofir, 441 — Itaperi, Fortaleza/CE',
  opening_hours text default 'Quarta a Sábado, 18:30 às 23:00',
  is_open boolean not null default true,
  delivery_fee_cents int not null default 0,
  min_order_cents int not null default 0,
  logo_url text,
  cover_url text,
  constraint single_row check (id = 1)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  delivery_type text not null check (delivery_type in ('delivery', 'pickup')),
  address text,
  payment_method text not null check (payment_method in ('pix', 'dinheiro', 'cartao')),
  notes text,
  subtotal_cents int not null,
  delivery_fee_cents int not null default 0,
  total_cents int not null,
  status text not null default 'recebido'
    check (status in ('recebido', 'preparando', 'pronto', 'saiu_para_entrega', 'entregue', 'cancelado')),
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_name text not null,
  unit_price_cents int not null,
  quantity int not null default 1,
  selected_options jsonb,
  notes text
);

-- ========== ROW LEVEL SECURITY ==========

alter table categories enable row level security;
alter table products enable row level security;
alter table product_option_groups enable row level security;
alter table product_options enable row level security;
alter table store_settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Cardápio e configurações: leitura pública, escrita só por admin autenticado
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "products_public_read" on products for select using (true);
create policy "products_admin_write" on products for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "option_groups_public_read" on product_option_groups for select using (true);
create policy "option_groups_admin_write" on product_option_groups for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "options_public_read" on product_options for select using (true);
create policy "options_admin_write" on product_options for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "settings_public_read" on store_settings for select using (true);
create policy "settings_admin_write" on store_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Pedidos: qualquer cliente pode criar; leitura por id (link de acompanhamento); só admin atualiza/lista tudo
create policy "orders_public_insert" on orders for insert with check (true);
create policy "orders_public_select_by_id" on orders for select using (true);
create policy "orders_admin_update" on orders for update using (auth.role() = 'authenticated');
create policy "orders_admin_delete" on orders for delete using (auth.role() = 'authenticated');

create policy "order_items_public_insert" on order_items for insert with check (true);
create policy "order_items_public_select" on order_items for select using (true);
create policy "order_items_admin_write" on order_items for update using (auth.role() = 'authenticated');
create policy "order_items_admin_delete" on order_items for delete using (auth.role() = 'authenticated');

-- ========== SEED: CONFIGURAÇÕES DA LOJA ==========

insert into store_settings (id, name, tagline, whatsapp_phone, address, opening_hours, is_open)
values (1, 'Espetinho do Beh', 'Sabor que une pessoas', '5585994495915', 'Rua Ofir, 441 — Itaperi, Fortaleza/CE', 'Quarta a Sábado, 18:30 às 23:00', true)
on conflict (id) do nothing;

-- ========== SEED: CATEGORIAS ==========

insert into categories (name, slug, sort_order) values
  ('Destaques', 'destaques', 0),
  ('Espetinhos', 'espetinhos', 1),
  ('Porções', 'porcoes', 2),
  ('Baião', 'baiao', 3),
  ('Arroz', 'arroz', 4),
  ('Combos', 'combos', 5),
  ('Bebidas', 'bebidas', 6),
  ('Pratos', 'pratos', 7),
  ('Massas', 'massas', 8)
on conflict (slug) do nothing;

-- ========== SEED: PRODUTOS ==========

do $$
declare
  cat_espetinhos uuid;
  cat_porcoes uuid;
  cat_baiao uuid;
  cat_arroz uuid;
  cat_combos uuid;
  cat_bebidas uuid;
  cat_pratos uuid;
  cat_massas uuid;
  macarrao_id uuid;
  g_massa uuid;
  g_proteina uuid;
  g_molho uuid;
  g_qtd_molho uuid;
  g_acompanhamentos uuid;
  g_toque uuid;
  g_extras uuid;
begin
  select id into cat_espetinhos from categories where slug = 'espetinhos';
  select id into cat_porcoes from categories where slug = 'porcoes';
  select id into cat_baiao from categories where slug = 'baiao';
  select id into cat_arroz from categories where slug = 'arroz';
  select id into cat_combos from categories where slug = 'combos';
  select id into cat_bebidas from categories where slug = 'bebidas';
  select id into cat_pratos from categories where slug = 'pratos';
  select id into cat_massas from categories where slug = 'massas';

  -- Espetinhos
  insert into products (category_id, name, price_cents, featured, sort_order) values
    (cat_espetinhos, 'Asinha', 800, false, 0),
    (cat_espetinhos, 'Coração de Frango', 800, false, 1),
    (cat_espetinhos, 'Coxinha da Asa', 800, false, 2),
    (cat_espetinhos, 'Frango', 800, false, 3),
    (cat_espetinhos, 'Linguiça', 800, false, 4),
    (cat_espetinhos, 'Porco', 800, false, 5),
    (cat_espetinhos, 'Carne com Bacon', 900, false, 6),
    (cat_espetinhos, 'Cupim', 900, false, 7),
    (cat_espetinhos, 'Medalhão de Carne', 900, false, 8),
    (cat_espetinhos, 'Fraldinha', 900, false, 9);

  -- Porções
  insert into products (category_id, name, price_cents, sort_order) values
    (cat_porcoes, 'Porção de Batata', 1000, 0),
    (cat_porcoes, 'Bolinha de Queijo (10un)', 1200, 1),
    (cat_porcoes, 'Bolinha de Carne do Sol (10un)', 1200, 2);

  -- Baião
  insert into products (category_id, name, price_cents, sort_order) values
    (cat_baiao, 'Baião P', 800, 0),
    (cat_baiao, 'Baião M', 1200, 1),
    (cat_baiao, 'Baião G', 1500, 2);

  -- Arroz
  insert into products (category_id, name, description, price_cents, featured, sort_order) values
    (cat_arroz, 'Arroz Pequeno', null, 600, false, 0),
    (cat_arroz, 'Arroz Médio', null, 800, false, 1),
    (cat_arroz, 'Arroz Grande', null, 1000, false, 2),
    (cat_arroz, 'Arroz de Camarão Cremoso', 'Cremoso, na medida certa.', 2500, true, 3),
    (cat_arroz, 'Arroz Maria Isabel Cremoso', null, 2500, false, 4);

  -- Combos
  insert into products (category_id, name, description, price_cents, featured, sort_order) values
    (cat_combos, 'Combo Jantinha', 'Espetinho + Baião + Farofa + Vinagrete + Refrigerante', 2000, false, 0),
    (cat_combos, 'Combo Dupla Perfeita', 'Baião P + 2 Espetinhos + Coca-Cola 1L + Porção de Batata + Porção de Bolinha', 5000, false, 1),
    (cat_combos, 'Combo Família Perfeita', 'Baião G + 4 Espetinhos + Coca-Cola 1L + Porção de Batata + Porção de Bolinha', 7000, true, 2);

  -- Bebidas
  insert into products (category_id, name, price_cents, sort_order) values
    (cat_bebidas, 'Coca-Cola Lata', 500, 0),
    (cat_bebidas, 'Coca-Zero Lata', 500, 1),
    (cat_bebidas, 'Sprite Lata', 500, 2),
    (cat_bebidas, 'Fanta Laranja ou Uva Lata', 500, 3),
    (cat_bebidas, 'Coca-Cola 1 Litro', 1000, 4),
    (cat_bebidas, 'Coca-Zero 1 Litro', 1000, 5),
    (cat_bebidas, 'Fanta 1 Litro', 1000, 6),
    (cat_bebidas, 'São Gerardo 1 Litro', 1000, 7),
    (cat_bebidas, 'Guaraná 1 Litro', 1000, 8),
    (cat_bebidas, 'Suco Copo 300ml', 500, 9),
    (cat_bebidas, 'Suco 1 Litro', 1200, 10),
    (cat_bebidas, 'Água com Gás', 400, 11),
    (cat_bebidas, 'Água Mineral', 400, 12);

  -- Pratos
  insert into products (category_id, name, description, price_cents, featured, sort_order) values
    (cat_pratos, 'Pratinho Tradicional', 'Creme de galinha, vatapá, arroz e farofa.', 1200, true, 0);

  -- Monte seu Macarrão (produto configurável)
  insert into products (category_id, name, description, price_cents, sort_order)
  values (cat_massas, 'Monte seu Macarrão', 'Sabor do seu jeito: escolha a massa, a proteína, o molho e os acompanhamentos.', 2000, 0)
  returning id into macarrao_id;

  insert into product_option_groups (product_id, name, type, required, sort_order)
  values (macarrao_id, 'Massa', 'single', true, 0) returning id into g_massa;
  insert into product_options (group_id, label, sort_order) values
    (g_massa, 'Parafuso', 0), (g_massa, 'Espaguete', 1), (g_massa, 'Penne', 2);

  insert into product_option_groups (product_id, name, type, required, sort_order)
  values (macarrao_id, 'Proteína', 'single', true, 1) returning id into g_proteina;
  insert into product_options (group_id, label, price_delta_cents, sort_order) values
    (g_proteina, 'Calabresa', 0, 0),
    (g_proteina, 'Frango Desfiado', 0, 1),
    (g_proteina, 'Carne do Sol', 500, 2),
    (g_proteina, 'Camarão', 500, 3);

  insert into product_option_groups (product_id, name, type, required, sort_order)
  values (macarrao_id, 'Molho', 'single', true, 2) returning id into g_molho;
  insert into product_options (group_id, label, sort_order) values
    (g_molho, 'Branco', 0), (g_molho, 'Vermelho', 1), (g_molho, 'Rosé', 2);

  insert into product_option_groups (product_id, name, type, required, sort_order)
  values (macarrao_id, 'Quantidade do molho', 'single', true, 3) returning id into g_qtd_molho;
  insert into product_options (group_id, label, sort_order) values
    (g_qtd_molho, 'Sem molho', 0), (g_qtd_molho, 'Pouco', 1), (g_qtd_molho, 'Normal', 2), (g_qtd_molho, 'Muito molho', 3);

  insert into product_option_groups (product_id, name, type, required, max_select, sort_order)
  values (macarrao_id, 'Acompanhamentos', 'multiple', false, 4, 4) returning id into g_acompanhamentos;
  insert into product_options (group_id, label, sort_order) values
    (g_acompanhamentos, 'Ovo de Codorna', 0),
    (g_acompanhamentos, 'Milho Verde', 1),
    (g_acompanhamentos, 'Queijo Coalho', 2),
    (g_acompanhamentos, 'Cebola', 3),
    (g_acompanhamentos, 'Cheiro Verde', 4),
    (g_acompanhamentos, 'Ervilha', 5),
    (g_acompanhamentos, 'Azeitona', 6);

  insert into product_option_groups (product_id, name, type, required, sort_order)
  values (macarrao_id, 'Toque final', 'single', true, 5) returning id into g_toque;
  insert into product_options (group_id, label, sort_order) values
    (g_toque, 'Orégano', 0),
    (g_toque, 'Pimenta Calabresa', 1),
    (g_toque, 'Queijo Parmesão', 2),
    (g_toque, 'Batata Palha', 3),
    (g_toque, 'Cheiro Verde', 4),
    (g_toque, 'Alho Frito', 5);

  insert into product_option_groups (product_id, name, type, required, sort_order)
  values (macarrao_id, 'Extras', 'multiple', false, 6) returning id into g_extras;
  insert into product_options (group_id, label, price_delta_cents, sort_order) values
    (g_extras, 'Calabresa', 500, 0),
    (g_extras, 'Frango Desfiado', 500, 1),
    (g_extras, 'Camarão', 500, 2),
    (g_extras, 'Carne do Sol', 500, 3);
end $$;
