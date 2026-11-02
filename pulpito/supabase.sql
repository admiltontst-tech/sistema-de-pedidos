-- Púlpito: tabela de sincronização das pregações (pode ficar no mesmo projeto do Hinário)
-- Cole tudo isto em Supabase > SQL Editor > New query e clique em "Run".

create table if not exists public.pulpito_itens (
  user_id         uuid        not null default auth.uid() references auth.users on delete cascade,
  id              text        not null,
  dados           jsonb,
  apagado         boolean     not null default false,
  editado_em      timestamptz not null,
  sincronizado_em timestamptz not null default clock_timestamp(),
  primary key (user_id, id)
);

create index if not exists pulpito_itens_sync_idx
  on public.pulpito_itens (user_id, sincronizado_em);

-- Marca a hora em que o servidor recebeu a alteração
-- e nunca deixa uma versão mais antiga sobrescrever uma mais nova.
create or replace function public.pulpito_itens_carimbo()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and new.editado_em < old.editado_em then
    return old;
  end if;
  new.sincronizado_em := clock_timestamp();
  return new;
end $$;

drop trigger if exists pulpito_itens_carimbo on public.pulpito_itens;
create trigger pulpito_itens_carimbo
  before insert or update on public.pulpito_itens
  for each row execute function public.pulpito_itens_carimbo();

-- Segurança: cada pessoa só enxerga e altera as próprias pregações
alter table public.pulpito_itens enable row level security;

drop policy if exists "ler os meus"      on public.pulpito_itens;
drop policy if exists "criar os meus"    on public.pulpito_itens;
drop policy if exists "alterar os meus"  on public.pulpito_itens;
drop policy if exists "apagar os meus"   on public.pulpito_itens;

create policy "ler os meus"     on public.pulpito_itens for select to authenticated using (user_id = auth.uid());
create policy "criar os meus"   on public.pulpito_itens for insert to authenticated with check (user_id = auth.uid());
create policy "alterar os meus" on public.pulpito_itens for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "apagar os meus"  on public.pulpito_itens for delete to authenticated using (user_id = auth.uid());
