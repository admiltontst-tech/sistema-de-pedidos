import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrderWithItems, getStoreSettings } from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import { paymentLabel } from "@/lib/order-status";
import { PrintButton } from "@/components/print-button";

export const revalidate = 0;

const DELIVERY_LABEL: Record<string, string> = {
  delivery: "Entrega:",
  pickup: "Retirada no local",
  local: "Atendimento no salão",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PrintOrderPage(props: PageProps<"/admin/pedidos/[id]/imprimir">) {
  const { id } = await props.params;
  const [result, settings] = await Promise.all([getOrderWithItems(id), getStoreSettings()]);

  if (!result) {
    notFound();
  }

  const { order, items } = result;

  return (
    <div className="min-h-screen bg-background py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-[380px] mx-auto">
        <div className="flex justify-center mb-5 print:hidden">
          <PrintButton />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 font-mono text-[13px] text-foreground print:border-none print:rounded-none print:shadow-none">
          <div className="text-center mb-4">
            {settings.logo_url && (
              <Image
                src={settings.logo_url}
                alt={settings.name}
                width={56}
                height={56}
                className="rounded-full object-cover mx-auto mb-2 print:grayscale"
              />
            )}
            <div className="font-bold text-base uppercase">{settings.name}</div>
            {settings.address && <div className="text-xs mt-1">{settings.address}</div>}
            {settings.whatsapp_phone && <div className="text-xs">{settings.whatsapp_phone}</div>}
          </div>

          <div className="border-t border-dashed border-foreground/30 my-3" />

          <div className="text-center font-bold">PEDIDO #{order.id.slice(0, 8).toUpperCase()}</div>
          <div className="text-center text-xs mb-3">{formatDateTime(order.created_at)}</div>

          <div className="border-t border-dashed border-foreground/30 my-3" />

          <div>
            <div>
              <span className="font-bold">Cliente:</span> {order.customer_name}
            </div>
            {order.delivery_type !== "local" && (
              <div>
                <span className="font-bold">Telefone:</span> {order.customer_phone}
              </div>
            )}
            <div className="mt-1">
              <span className="font-bold">{DELIVERY_LABEL[order.delivery_type]}</span>{" "}
              {order.delivery_type === "delivery" ? order.address : ""}
            </div>
          </div>

          <div className="border-t border-dashed border-foreground/30 my-3" />

          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between font-semibold">
                  <span>
                    {item.quantity}x {item.product_name}
                  </span>
                  <span>{formatMoney(item.unit_price_cents * item.quantity)}</span>
                </div>
                {item.selected_options &&
                  Object.entries(item.selected_options).map(([group, values]) => (
                    <div key={group} className="text-xs pl-3 text-foreground/70">
                      {group}: {values.join(", ")}
                    </div>
                  ))}
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-foreground/30 my-3" />

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de entrega</span>
              <span>{formatMoney(order.delivery_fee_cents)}</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-1">
              <span>TOTAL</span>
              <span>{formatMoney(order.total_cents)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-foreground/30 my-3" />

          <div>
            <span className="font-bold">Pagamento:</span> {paymentLabel(order.payment_method)}
          </div>
          {order.notes && (
            <div className="mt-1">
              <span className="font-bold">Obs:</span> {order.notes}
            </div>
          )}

          <div className="text-center text-xs mt-5">Obrigado pela preferência!</div>
        </div>
      </div>
    </div>
  );
}
