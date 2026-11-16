# Como replicar este sistema para um novo cliente

Este projeto foi feito para o Espetinho do Beh, mas a base (cardápio digital +
painel admin + mesas/garçom + notificações) serve pra qualquer
restaurante/lanchonete. Este arquivo é o roteiro pra montar uma cópia nova
rapidamente, sem perder tempo reconstruindo do zero.

## 0. Criar o repositório do novo cliente

- No GitHub, abra este repositório e clique em **"Use this template" → "Create a new repository"**
  (esse botão só aparece se o repositório estiver marcado como "Template repository" em
  Settings → General → Template repository — é um clique único, feito uma vez só, aqui
  mesmo neste repo original).
- Dê o nome do novo cliente ao repositório (ex: `sistema-de-pedidos-nome-do-cliente`).
- Clone o novo repositório e comece a editar a partir dele.

## 1. Supabase (banco de dados)

1. Crie um **novo projeto** em supabase.com (cada cliente tem seu próprio banco,
   nunca reaproveite o mesmo projeto).
2. No SQL Editor do projeto novo, rode os arquivos de `supabase/` **nesta ordem**:
   1. `schema.sql`
   2. `fix_orders_rls.sql`
   3. `add_welcome_fields.sql`
   4. `add_instagram.sql`
   5. `add_promo.sql`
   6. `add_realtime.sql`
   7. `add_storage.sql`
   8. `add_tabs.sql`
   9. `add_push_notifications.sql` (troque o domínio e o segredo antes de rodar — veja seção 4)
   10. `add_promo_image.sql`
   - **Não rode `seed_images.sql`** — esse é específico do cardápio do Espetinho do Beh.
3. Em Project Settings → API, copie a **URL do projeto** e a **chave anon (publishable)**.
4. Em Project Settings → API → Service role, copie a **service role key** (fica só no
   servidor, nunca no navegador).
5. Crie o primeiro login de administrador em Authentication → Users → Add user
   (e-mail + senha; marque "Auto Confirm User").

## 2. Variáveis de ambiente (Vercel e `.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=<url do novo projeto>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave anon do novo projeto>
SUPABASE_SERVICE_ROLE_KEY=<chave service role do novo projeto>

VAPID_PUBLIC_KEY=<gerar novo, veja seção 4>
VAPID_PRIVATE_KEY=<gerar novo, veja seção 4>
VAPID_SUBJECT=mailto:<e-mail de contato do cliente>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<mesmo valor de VAPID_PUBLIC_KEY>
PUSH_WEBHOOK_SECRET=<gerar novo, veja seção 4>
```

## 3. Identidade visual do cliente

- **Logo**: troque `public/icons/admin-icon-192.png`, `admin-icon-512.png` e
  `admin-icon-apple-180.png` pelo logo do novo cliente (gere com `ffmpeg -i logo.jpg
  -vf scale=WxH saida.png` nos tamanhos 192x192, 512x512 e 180x180).
- **Cores da marca**: ajuste os tokens em `src/app/globals.css`
  (`--accent`, `--accent-dark`, `--accent-ink`, `--heading`, `--background` etc.).
- **Nome, frase, endereço, horário, WhatsApp, Instagram**: não precisa mexer no
  código — depois do primeiro login, preencha tudo isso em **Configurações**, direto
  no painel.
- **Cardápio**: categorias e produtos são cadastrados pelo próprio painel
  (Cardápio → Nova categoria / Adicionar produto). Não tem import automático —
  é cadastro manual mesmo (ou peça pro cliente passar a lista que você digita).

## 4. Notificações push (opcional, mas recomendado)

1. Gere um par de chaves novo: `npx web-push generate-vapid-keys`.
2. Gere um segredo novo pro webhook: `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`.
3. Preencha esses valores nas variáveis de ambiente (seção 2) e também dentro do
   arquivo `supabase/add_push_notifications.sql` **antes** de rodar (domínio real do
   novo cliente em produção + o mesmo segredo).

## 5. Deploy

1. Crie um novo projeto na Vercel, apontando pro repositório do novo cliente.
2. Cole as variáveis de ambiente da seção 2 em Vercel → Settings → Environment Variables.
3. Configure o domínio (customizado ou o `*.vercel.app` padrão).
4. Faça o primeiro deploy e teste: cardápio público, login do admin, cadastro de
   produto, pedido de teste, notificação push.

## 6. Manual e documento do cliente

- O manual "Como usar" (`/admin/ajuda`) já é genérico — só confirme se algum texto
  menciona "Espetinho do Beh" e troque pelo nome do novo cliente.
- Se for montar o mesmo documento de apresentação (Word/PDF) que fizemos aqui,
  use como base os arquivos gerados nesta conversa — troque nome, logo e prints
  de tela pelos do novo cliente.

---

**Resumo rápido**: template no GitHub → projeto novo no Supabase → rodar as
migrações (sem o seed) → variáveis de ambiente novas → logo/cores → deploy na
Vercel → cadastrar cardápio pelo painel. Com isso dá pra montar o sistema de um
cliente novo em bem menos tempo do que da primeira vez.
