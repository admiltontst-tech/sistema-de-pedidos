import { PrivacyPanel } from "@/components/privacy-panel";

export const revalidate = 0;

export default function AdminPrivacyPage() {
  return (
    <div>
      <h1 className="font-display text-xl text-heading mb-1">Privacidade (LGPD)</h1>
      <p className="text-muted text-sm mb-5">
        Use essa tela quando um cliente pedir pra ver ou apagar os dados dele (nome, telefone,
        endereço, pedidos). Busque pelo nome ou telefone informado no pedido, confira os
        resultados e baixe ou exclua definitivamente.
      </p>
      <PrivacyPanel />
    </div>
  );
}
