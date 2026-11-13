import Link from "next/link";
import { getStoreSettings } from "@/lib/queries";

export const revalidate = 0;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="font-display font-bold text-heading text-lg">{title}</h2>
      <div className="text-sm text-foreground/90 leading-relaxed flex flex-col gap-2.5">
        {children}
      </div>
    </section>
  );
}

export default async function PrivacyPage() {
  const settings = await getStoreSettings();
  const whatsappUrl = `https://wa.me/${settings.whatsapp_phone}`;

  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div>
          <Link href="/" className="text-accent-dark font-semibold text-sm underline">
            ← Voltar ao cardápio
          </Link>
          <h1 className="font-display text-2xl text-heading mt-4">
            Política de Privacidade e Termos de Uso
          </h1>
          <p className="text-muted text-sm mt-1.5">
            {settings.name} — última atualização: novembro de 2026.
          </p>
        </div>

        <Section title="Quem somos">
          <p>
            Este site é o cardápio e canal de pedidos de <strong className="text-heading">{settings.name}</strong>
            {settings.address ? `, localizado em ${settings.address}` : ""}. Pra dúvidas sobre esta
            política ou sobre seus dados, fale com a gente pelo{" "}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-accent-dark underline">
              WhatsApp
            </a>
            .
          </p>
        </Section>

        <Section title="Quais dados coletamos">
          <p>Quando você faz um pedido pelo site, coletamos:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Nome e telefone, pra identificar o pedido e entrar em contato se precisar.</li>
            <li>Endereço, apenas se você escolher entrega.</li>
            <li>Forma de pagamento escolhida e observações que você escrever.</li>
            <li>Os itens do pedido (produtos, quantidades e opções escolhidas).</li>
          </ul>
          <p>Não pedimos CPF, dados de cartão, nem nenhum dado sensível.</p>
        </Section>

        <Section title="Para que usamos seus dados">
          <p>
            Usamos esses dados só pra processar, preparar e entregar o seu pedido, e pra falar com
            você pelo WhatsApp caso seja preciso confirmar algo. Essa é a base legal prevista na
            LGPD (Lei 13.709/2018, art. 7º, V): o tratamento é necessário pra cumprir o pedido que
            você mesmo fez.
          </p>
          <p>
            Não usamos seus dados pra envio de propaganda, não vendemos nem compartilhamos com
            empresas de marketing.
          </p>
        </Section>

        <Section title="Compartilhamento com o WhatsApp">
          <p>
            Ao finalizar o pedido, o site monta uma mensagem de resumo e abre o seu WhatsApp pra
            você mesmo enviar pra gente — é você quem confirma e envia essa mensagem, pelo seu
            próprio aparelho. A partir daí, a conversa fica sujeita aos termos de privacidade do
            WhatsApp/Meta.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            O site público não usa cookies de rastreamento nem ferramentas de analytics de
            terceiros. O único cookie usado é técnico, só no painel administrativo, pra manter a
            sessão de quem gerencia a loja logada.
          </p>
        </Section>

        <Section title="Por quanto tempo guardamos seus dados">
          <p>
            Guardamos os pedidos pra manter um histórico de atendimento e por segurança jurídica,
            caso seja necessário esclarecer algo sobre uma compra. Você pode pedir a exclusão a
            qualquer momento — veja como abaixo.
          </p>
        </Section>

        <Section title="Seus direitos">
          <p>
            De acordo com a LGPD (art. 18), você pode a qualquer momento pedir pra:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Confirmar quais dados seus temos guardados;</li>
            <li>Corrigir algum dado errado;</li>
            <li>Receber uma cópia dos seus dados;</li>
            <li>Pedir a exclusão definitiva dos seus dados.</li>
          </ul>
          <p>
            Pra exercer qualquer um desses direitos, é só chamar a gente no{" "}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-accent-dark underline">
              WhatsApp
            </a>{" "}
            informando o nome e telefone usados no pedido. Respondemos o quanto antes.
          </p>
        </Section>

        <Section title="Segurança">
          <p>
            Os dados ficam guardados num banco de dados com controle de acesso, e só a pessoa
            responsável pela loja consegue ver e gerenciar os pedidos através de um login protegido
            por senha.
          </p>
        </Section>

        <Section title="Termos de uso do cardápio">
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Os preços e a disponibilidade dos produtos podem mudar sem aviso prévio.</li>
            <li>
              O pedido só é considerado confirmado depois que a mensagem é enviada e recebida pelo
              nosso WhatsApp.
            </li>
            <li>O tempo de entrega mostrado no site é uma estimativa e pode variar.</li>
            <li>
              Você pode cancelar o pedido entrando em contato antes do início do preparo, conforme
              o Código de Defesa do Consumidor.
            </li>
          </ul>
        </Section>

        <p className="text-muted text-xs pt-4 border-t border-border-soft">
          Esta política pode ser atualizada de tempos em tempos. A data no topo desta página
          mostra a versão mais recente.
        </p>
      </div>
    </div>
  );
}
