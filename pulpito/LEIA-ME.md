# Púlpito: app de pregações (PWA)

App para preparar e pregar sermões, com marcações coloridas, "você está aqui",
Bíblia completa no aparelho, modo púlpito com cronômetro, agenda, histórico,
backup e sincronização entre computador e celular. É irmão do Hinário: tem o mesmo visual,
instala do mesmo jeito e funciona **sem internet** depois de aberto uma vez.

## Arquivos
- `index.html`: o app inteiro
- `biblia/blivre.json`: Bíblia Livre completa (66 livros, 31.102 versículos)
- `config.js`: endereço e chave do Supabase (já preenchido com o mesmo projeto do Hinário)
- `supabase.sql`: cria a tabela das pregações (rode uma vez no Supabase)
- `vendor/supabase.js`: biblioteca do Supabase, guardada no app para funcionar offline
- `sw.js`: guarda o app e a Bíblia no aparelho (offline)
- `manifest.webmanifest` + `icons/`: nome e ícone para instalar na tela inicial
- `vercel.json`: configurações para a Vercel
- `ferramentas/converter-biblia.py`: script usado para gerar `biblia/blivre.json`

## 1. Criar a tabela no Supabase (uma vez, 2 minutos)
O Púlpito usa o **mesmo projeto do Hinário** e o mesmo login, mas as pregações
ficam numa tabela separada.
1. Entre em supabase.com e abra o projeto do Hinário.
2. **SQL Editor** > **New query**, cole todo o conteúdo de `supabase.sql` e clique em **Run**.
   Deve aparecer "Success. No rows returned".

Para usar outro projeto, troque os dois valores em `config.js`.

## 2. Publicar na Vercel
1. Na Vercel: **Add New** > **Project** e escolha este repositório.
2. Em **Root Directory**, escolha a pasta `pulpito`.
3. Em **Framework Preset**, escolha **Other**. Deixe o comando de build vazio.
4. **Deploy**. Cada mudança que entrar na branch principal publica sozinha.

## 3. Instalar e entrar
- **Android (Chrome):** abra o link > menu ⋮ > "Instalar app".
- **iPhone (Safari):** abra o link > Compartilhar > "Adicionar à Tela de Início".
- Abra uma vez **com internet**: o app baixa a Bíblia (cerca de 1,2 MB) e daí em diante funciona offline.
- Toque em **Entrar** no topo e use o mesmo e-mail e senha do Hinário, nos dois aparelhos.

O indicador no topo mostra: **Sincronizado**, **Sincronizando…**, **Offline (n)** (n alterações
esperando a internet) ou **Erro ao sincronizar** (toque para ver o motivo).

## Como escrever uma pregação
Toque em **Nova pregação**, preencha os dados e escreva o esboço. Os sinais no começo da
linha viram marcações (os botões acima do texto inserem cada um):

| Escreva | Vira |
|---|---|
| `# I. Título do ponto {8}` | Nova seção com 8 minutos previstos |
| `## Subtítulo` | Subtítulo dentro da seção |
| `> Jo 15:4-5` | Leitura com o texto bíblico completo |
| `!! frase` | **Ponto-chave** (dourado) |
| `?? pergunta` | **Pergunta à igreja** (azul) |
| `[ilustração] texto` | **Ilustração** (verde) |
| `[aplicação] texto` | **Aplicação** (roxo) |
| `[apelo] texto` | **Apelo** (vermelho) |
| `[pausa]` | Linha de pausa |
| `- texto` | Tópico |
| `**texto**` / `==texto==` | Negrito / grifo |

Referências escritas em qualquer lugar (`Jo 3:16`, `João 3.16`, `1 Co 13:4-7`, `Sl 23`, `Gl 5:22–23`)
viram botões que mostram o versículo.

## Na hora de pregar
Abra a pregação > **Modo púlpito**. A tela fica cheia e não apaga.
- **Próximo ponto** (ou espaço, seta para baixo, ou o botão de um passador de slides) avança o destaque "VOCÊ ESTÁ AQUI".
- Toque em qualquer parágrafo para marcar onde está. ← → pula de seção.
- **Iniciar cronômetro**: o relógio geral fica laranja perto do fim e vermelho quando passa;
  cada seção tem o seu tempo no roteiro e no topo.
- Toque numa referência para mostrar o versículo em letra grande para ler à igreja.
- **Rolar** desce o texto sozinho; tocar no texto pausa.
- Ao sair, se pregou mais de 2 minutos, o app oferece registrar no histórico ("Onde já preguei").

## Backup
**Backup** > **Baixar arquivo** (ou **Copiar texto**). Para restaurar, abra o arquivo ou cole o texto.
Restaurar junta com o que já existe e não apaga nada.

## Bíblia
Texto da **Bíblia Livre (BLIVRE)**, tradução de licença aberta (Creative Commons Atribuição).
Versões como ARC, ARA e NVI têm direitos das editoras e não podem ser incluídas sem licença.
