import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { getOrderWithItems } from "@/lib/queries";
import { formatMoney } from "@/lib/money";
import type { OrderStatus } from "@/lib/types";

export const revalidate = 0;

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "recebido", label: "Recebido" },
  { status: "preparando", label: "Preparando" },
  { status: "pronto", label: "Pronto" },
  { status: "saiu_para_entrega", label: "Saiu para entrega" },
  { status: "entregue", label: "Entregue" },
];

const PAYMENT_LABEL: Record<string, string> = { pix: "Pix", dinheiro: "Dinheiro", cartao: "Cartão" };

export default async function OrderTrackingPage(props: PageProps<"/pedido/[id]">) {
  const { id } = await props.params;
  const result = await getOrderWithItems(id);

  if (!result) {
    notFound();
  }

  const { order, items } = result;
  const currentIndex = STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === "cancelado";

  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="max-w-xl mx-auto">
        <Link href="/" className="text-accent-dark font-semibold text-sm underline">
          ← Voltar ao cardápio
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-6 mt-5">
          <div className="text-muted text-xs">Pedido</div>
          <h1 className="font-display text-xl text-heading">#{order.id.slice(0, 8)}</h1>

          {isCancelled ? (
            <div className="mt-5 bg-[#D62828]/10 text-[#B91C1C] font-semibold text-sm px-4 py-3 rounded-lg">
              Este pedido foi cancelado.
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              {STEPS.map((step, i) => {
                const done = i <= currentIndex;
                return (
                  <div key={step.status} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 size={20} className="text-[#1F9D55] flex-shrink-0" />
                    ) : (
                      <Circle size={20} className="text-border flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm font-semibold ${done ? "text-heading" : "text-muted"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-border-soft">
            <div className="text-muted text-xs font-bold uppercase mb-2">Itens</div>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-1.5">
                <span className="text-foreground">
                  {item.quantity}x {item.product_name}
                </span>
                <span className="font-semibold text-foreground">
                  {formatMoney(item.unit_price_cents * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border-soft space-y-1.5">
            <div className="flex justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal_cents)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted">
              <span>Taxa de entrega</span>
              <span>{formatMoney(order.delivery_fee_cents)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-heading text-base pt-1.5">
              <span>Total</span>
              <span>{formatMoney(order.total_cents)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border-soft text-sm text-muted space-y-1">
            <div>
              {order.delivery_type === "delivery" ? `Entrega em: ${order.address}` : "Retirada no local"}
            </div>
            <div>Pagamento: {PAYMENT_LABEL[order.payment_method] ?? order.payment_method}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
