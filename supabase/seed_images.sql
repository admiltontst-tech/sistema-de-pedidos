-- Preenche as fotos reais dos produtos e da loja.
-- Rode no SQL Editor do Supabase (depois do schema.sql e do fix_orders_rls.sql).

update store_settings set
  logo_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/logo/4732ceb6-4076-4c89-9825-1fa7a4bc7635-low.jpg',
  cover_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/logo/8b69cf3e-8bc4-464c-835f-23f5c1283ee7-large.jpg'
where id = 1;

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/070376fb-412a-48c1-a25c-93fe606d4a6e-low.jpg'
where name in ('Asinha','Coração de Frango','Coxinha da Asa','Frango','Linguiça','Porco','Carne com Bacon','Cupim','Medalhão de Carne','Fraldinha');

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/9996fa52-d216-419f-a5a8-f611c5a19967-low.jpg'
where name = 'Porção de Batata';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/fe8da755-9c04-4929-8609-cc47d2954f59-low.jpg'
where name = 'Bolinha de Queijo (10un)';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/c182839e-51ef-45b6-8044-6d9d2588a155-low.jpg'
where name = 'Bolinha de Carne do Sol (10un)';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/1f35440f-9d16-4a60-8c8f-56de4e61155f-low.jpg'
where name = 'Baião P';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/62da61f1-85b7-4b9d-925c-d4e7dd3c1d3e-low.jpg'
where name = 'Baião M';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/a9f1a7fb-040e-4dfd-8c06-3110e9d4cb9d-low.jpg'
where name = 'Baião G';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/747dee8a-4633-4dd0-8822-f3a03c1cf31a-low.jpg'
where name = 'Arroz Pequeno';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/e7dfa37a-66e5-4296-8bd7-3f70edbb9252-low.jpg'
where name in ('Arroz Médio', 'Arroz Grande');

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/abab691a-f14d-4b76-ab53-9682e2295173-low.jpg'
where name = 'Arroz de Camarão Cremoso';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/341e172e-3cf8-41e8-956e-57e250ccb821-low.jpg'
where name = 'Arroz Maria Isabel Cremoso';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/3a54e29d-7832-4f3b-85fb-5eec229da495-low.jpg'
where name = 'Combo Jantinha';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/2f81618c-1ec9-470c-9b0f-d74ad61a680b-low.jpg'
where name = 'Combo Dupla Perfeita';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/73f6dcb1-cb74-4494-a66c-b7276d98b394-low.jpg'
where name = 'Combo Família Perfeita';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/80d3c6cc-4329-4339-a739-31ea7ad97d34-low.jpg'
where name in ('Coca-Cola Lata','Coca-Zero Lata','Sprite Lata','Fanta Laranja ou Uva Lata');

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/7b9ead2b-c015-495a-9949-dc5316abd388-low.jpg'
where name in ('Coca-Cola 1 Litro','Coca-Zero 1 Litro','Fanta 1 Litro','São Gerardo 1 Litro','Guaraná 1 Litro');

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/8340070e-e86d-49a4-85c3-0e3f3b6b9c18-low.jpg'
where name = 'Suco Copo 300ml';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/4cf4ad32-2dfc-49f0-b7c0-73ba4d9952a6-low.jpg'
where name = 'Suco 1 Litro';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/325a1f16-5d63-4e39-9adf-c39b11408fe3-low.jpg'
where name = 'Água com Gás';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/f1da04a1-baaa-4365-aa80-6611432df931-low.jpg'
where name = 'Água Mineral';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/8caa00b3-38b7-42cf-963f-9c88d09ae453-low.jpg'
where name = 'Pratinho Tradicional';

update products set image_url = 'https://assets.diggy.menu/menu/69ae1943a8f663c4238b7f37/products/2ea16010-d1c9-487f-8ff9-a9392f6e6e49-low.jpg'
where name = 'Monte seu Macarrão';

update products set badge = 'Mais pedido' where name = 'Combo Família Perfeita';
update products set badge = 'Novidade' where name = 'Pratinho Tradicional';
update products set badge = 'Especial' where name = 'Arroz de Camarão Cremoso';
