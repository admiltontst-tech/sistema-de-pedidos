import {
  ClipboardList,
  UtensilsCrossed,
  Settings,
  Printer,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Volume2,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="w-9 h-9 rounded-lg bg-chip flex items-center justify-center flex-shrink-0">
          <Icon size={17} className="text-accent-dark" />
        </div>
        <h2 className="font-display font-bold text-heading text-base">{title}</h2>
      </div>
      <div className="text-sm text-foreground/90 leading-relaxed flex flex-col gap-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_strong]:text-heading">
        {children}
      </div>
    </section>
  );
}

export default function AdminHelpPage() {
  return (
    <div>
      <h1 className="font-display text-xl text-heading mb-1">Manual de uso</h1>
      <p className="text-muted text-sm mb-6">
        Guia rápido de como usar o painel administrativo do Espetinho do Beh.
      </p>

      <div className="flex flex-col gap-4">
        <Section icon={ClipboardList} title="Pedidos">
          <p>
            Assim que um cliente finaliza um pedido no site, ele aparece automaticamente na tela{" "}
            <strong>Pedidos</strong> (a primeira aba do painel).
          </p>
          <ol>
            <li>No topo, três números rápidos: quantos pedidos entraram hoje, quanto já faturou hoje e quantos pedidos ainda estão em aberto.</li>
            <li>Cada linha mostra o cliente, telefone, se é entrega ou retirada, e o valor total.</li>
            <li>
              Use o menu colorido de <strong>status</strong> pra ir atualizando o andamento: Recebido →
              Preparando → Pronto → Saiu para entrega → Entregue. Se o cliente desistir, marque como
              Cancelado.
            </li>
          </ol>
          <p>A atualização é só clicar no status e escolher o novo — salva na hora, sem precisar confirmar nada.</p>
        </Section>

        <Section icon={Volume2} title="Aviso de pedido novo">
          <p>
            Com o painel aberto (mesmo em outra aba ou minimizado), toda vez que um pedido novo
            chega toca um som e aparece um aviso na tela com o nome do cliente. Não precisa ficar
            atualizando a página — é automático.
          </p>
        </Section>

        <Section icon={Printer} title="Imprimir comanda">
          <p>
            Ao lado do status de cada pedido tem um ícone de impressora. Clicando nele, abre uma
            comanda pronta pra imprimir com todos os itens, endereço, forma de pagamento e
            observações do cliente.
          </p>
          <ol>
            <li>Clique no ícone de impressora na linha do pedido.</li>
            <li>Uma nova aba abre com a comanda formatada.</li>
            <li>Clique no botão laranja <strong>Imprimir</strong> no topo e escolha sua impressora normal.</li>
          </ol>
        </Section>

        <Section icon={UtensilsCrossed} title="Cardápio">
          <p>Na aba <strong>Cardápio</strong>, os produtos aparecem agrupados por categoria.</p>
          <ul>
            <li><strong>+ Nova categoria:</strong> no topo da página, cria uma categoria nova (ex: Sobremesas).</li>
            <li><strong>Nome da categoria:</strong> passe o mouse (ou toque, no celular) em cima do nome pra ver o lápis de editar e a lixeira de excluir. Só dá pra excluir categoria vazia — se tiver produto dentro, mova ou apague os produtos antes.</li>
            <li><strong>Foto do produto:</strong> clique na miniatura (a fotinho ao lado do nome) pra escolher uma foto nova do celular ou computador — troca na hora.</li>
            <li><strong>Preço:</strong> clique no valor, digite o novo preço e clique fora do campo — salva sozinho.</li>
            <li><strong>Disponível / Indisponível:</strong> clique pra alternar. Fica vermelho (Indisponível) quando o produto some do site temporariamente, sem precisar apagar — útil quando acaba o ingrediente.</li>
            <li><strong>Destaque:</strong> marca o produto pra aparecer na seção &quot;Destaques da casa&quot;, no topo do cardápio público.</li>
            <li><strong>+ Adicionar produto:</strong> no final de cada categoria, cria um item novo com nome, descrição, preço e foto (opcional).</li>
            <li><strong>Remover:</strong> apaga o produto definitivamente (pede confirmação antes).</li>
          </ul>
        </Section>

        <Section icon={SlidersHorizontal} title="Opções de produto (ex: Monte seu Macarrão)">
          <p>
            Pra produtos que o cliente precisa escolher coisas (massa, proteína, molho, extras),
            clique no botão <strong>Opções</strong> na linha do produto. Abre um editor onde dá pra:
          </p>
          <ul>
            <li><strong>Grupo:</strong> ex: &quot;Massa&quot;, &quot;Proteína&quot;, &quot;Molho&quot;. Dá nome, escolhe se é escolha única ou múltipla escolha, se é obrigatório, e (na múltipla) o máximo de opções que o cliente pode marcar.</li>
            <li><strong>Opções dentro do grupo:</strong> ex: &quot;Parmegiana&quot;, &quot;+ R$ 5,00&quot;. Edite o nome e o valor adicional a qualquer momento, clicando e saindo do campo.</li>
            <li><strong>+ Grupo</strong> e <strong>+ opção:</strong> adicionam novos grupos e novas opções.</li>
            <li>O ícone de lixeira remove grupos ou opções (pede confirmação pra remover um grupo inteiro).</li>
          </ul>
          <p>Não precisa mais entrar no Supabase pra isso — tudo é feito aqui no painel.</p>
        </Section>

        <Section icon={Settings} title="Configurações da loja">
          <ul>
            <li><strong>Loja aberta/fechada:</strong> o botão no topo alterna o status que aparece pros clientes no site. Lembre de marcar como fechada fora do horário de funcionamento.</li>
            <li><strong>Promoção:</strong> ative e escreva um título e as regras (ex: &quot;Quarta do Baião&quot;) pra aparecer em destaque no topo do site. Desative quando a promoção acabar — o texto fica salvo pra próxima vez.</li>
            <li><strong>Nome, frase, endereço, horário:</strong> aparecem no cabeçalho e no rodapé do site público.</li>
            <li><strong>WhatsApp:</strong> número que recebe os pedidos (só números, com DDI 55 e DDD, ex: 5585999999999).</li>
            <li><strong>Instagram:</strong> coloque só o usuário (sem @) pra aparecer um atalho clicável no site.</li>
            <li><strong>Tempo estimado de entrega:</strong> texto livre (ex: &quot;40-60 min&quot;) mostrado pro cliente no cardápio.</li>
            <li><strong>Mensagem de boas-vindas:</strong> texto que aparece em destaque pro cliente ao abrir o site.</li>
            <li><strong>Taxa de entrega e pedido mínimo:</strong> aplicados automaticamente no checkout do cliente.</li>
            <li><strong>Número de mesas:</strong> quantas mesas aparecem na aba Mesas (ajuste conforme o salão).</li>
          </ul>
          <p className="text-muted text-xs">
            Mais abaixo nessa mesma página, em <strong className="text-heading">Acesso da equipe</strong>,
            dá pra criar um login separado pro garçom.
          </p>
        </Section>

        <Section icon={LayoutGrid} title="Mesas e comandas (pedido do garçom)">
          <p>
            Na aba <strong>Mesas</strong>, o garçom registra o pedido de quem está no salão, sem
            precisar passar pelo WhatsApp.
          </p>
          <ol>
            <li>Toque no número da mesa (ou em <strong>+ Nova comanda</strong>, pra quem não tem mesa fixa, tipo balcão).</li>
            <li>Escolha os produtos do cardápio — a mesa fica &quot;aberta&quot;, acumulando os pedidos.</li>
            <li>O cliente pode pedir mais de uma vez: é só voltar na mesma mesa e tocar em <strong>Adicionar pedido</strong>.</li>
            <li>Cada rodada aparece com o status (Recebido, Preparando...) e pode ser impressa pra cozinha, igual aos pedidos online.</li>
            <li>No final, toque em <strong>Fechar conta</strong>, escolha a forma de pagamento e confirme — a mesa volta a ficar livre.</li>
          </ol>
          <p className="text-muted text-xs">
            Acesso do garçom: crie um login dele em Configurações → Acesso da equipe. Esse login só
            abre a tela de Mesas — sem ver Cardápio, Configurações, nem dados de outros clientes.
          </p>
        </Section>

        <Section icon={Share2} title="Divulgando o cardápio">
          <p>
            O link do site (ex: <span className="font-mono text-xs bg-chip px-1.5 py-0.5 rounded">sistema-de-pedidos-nu.vercel.app</span>)
            pode ser compartilhado direto no WhatsApp, Instagram ou impresso num QR code pra colocar
            nas mesas.
          </p>
        </Section>

        <Section icon={ShieldCheck} title="Privacidade (LGPD)">
          <p>
            Se algum cliente pedir pra ver ou apagar os dados dele (direito garantido pela LGPD),
            use a aba <strong>Privacidade</strong>.
          </p>
          <ol>
            <li>Busque pelo nome ou telefone que o cliente usou no pedido.</li>
            <li>Confira a lista de pedidos encontrados e desmarque qualquer um que não seja dele.</li>
            <li>
              Clique em <strong>Baixar dados</strong> pra gerar um arquivo com tudo que temos
              daquele cliente, ou em <strong>Excluir definitivamente</strong> pra apagar os pedidos
              e os dados dele do sistema (não tem como desfazer).
            </li>
          </ol>
          <p className="text-muted text-xs">
            Veja também a Política de Privacidade do site, linkada no rodapé do cardápio público.
          </p>
        </Section>

        <Section icon={ShieldAlert} title="Acesso e segurança">
          <ul>
            <li>Nunca compartilhe seu e-mail e senha do painel com outras pessoas.</li>
            <li>Clique em <strong>Sair</strong> (canto superior direito) ao terminar de usar um computador compartilhado.</li>
            <li>Problemas de acesso ou dúvidas técnicas: fale com quem desenvolveu o sistema.</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
