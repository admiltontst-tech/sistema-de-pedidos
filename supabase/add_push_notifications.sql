-- Notificações push (funcionam mesmo com o celular bloqueado/em segundo
-- plano, diferente do som tocado dentro da página).
--
-- ANTES DE RODAR: troque COLE_AQUI_O_PUSH_WEBHOOK_SECRET abaixo pelo mesmo
-- valor que você colocou na variável PUSH_WEBHOOK_SECRET na Vercel.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_own_rows" on push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create extension if not exists pg_net with schema extensions;

create or replace function notify_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url := 'https://espetinho-do-beh.vercel.app/api/push/notify-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'COLE_AQUI_O_PUSH_WEBHOOK_SECRET'
    ),
    body := jsonb_build_object('order_id', new.id)
  );
  return new;
end;
$$;

drop trigger if exists orders_notify_push on orders;

create trigger orders_notify_push
  after insert on orders
  for each row
  execute function notify_new_order();
