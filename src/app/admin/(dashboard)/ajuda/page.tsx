import {
  ClipboardList,
  UtensilsCrossed,
  Settings,
  Printer,
  Share2,
  ShieldAlert,
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
            <li><strong>Preço:</strong> clique no valor, digite o novo preço e clique fora do campo — salva sozinho.</li>
            <li><strong>Disponível:</strong> desmarque pra esconder um produto do site temporariamente (ex: acabou o ingrediente) sem precisar apagar.</li>
            <li><strong>Destaque:</strong> marca o produto pra aparecer na seção "Destaques da casa", no topo do cardápio público.</li>
            <li><strong>+ Adicionar produto:</strong> no final de cada categoria, cria um item novo com nome, descrição e preço.</li>
            <li><strong>Remover:</strong> apaga o produto definitivamente (pede confirmação antes).</li>
          </ul>
          <p className="text-muted text-xs">
            As opções do &quot;Monte seu Macarrão&quot; (massa, proteína, molho, extras) ainda precisam
            ser editadas direto no Supabase — se quiser, posso te mostrar como ou criar uma tela pra isso.
          </p>
        </Section>

        <Section icon={Settings} title="Configurações da loja">
          <ul>
            <li><strong>Loja aberta/fechada:</strong> o botão no topo alterna o status que aparece pros clientes no site. Lembre de marcar como fechada fora do horário de funcionamento.</li>
            <li><strong>Nome, frase, endereço, horário:</strong> aparecem no cabeçalho e no rodapé do site público.</li>
            <li><strong>WhatsApp:</strong> número que recebe os pedidos (só números, com DDI 55 e DDD, ex: 5585999999999).</li>
            <li><strong>Taxa de entrega e pedido mínimo:</strong> aplicados automaticamente no checkout do cliente.</li>
          </ul>
        </Section>

        <Section icon={Share2} title="Divulgando o cardápio">
          <p>
            O link do site (ex: <span className="font-mono text-xs bg-chip px-1.5 py-0.5 rounded">sistema-de-pedidos-nu.vercel.app</span>)
            pode ser compartilhado direto no WhatsApp, Instagram ou impresso num QR code pra colocar
            nas mesas.
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
