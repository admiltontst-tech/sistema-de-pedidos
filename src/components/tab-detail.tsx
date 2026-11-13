"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Printer, Loader2, X } from "lucide-react";
import { closeTab, cancelOrderRound } from "@/app/admin/tabs-actions";
import { WaiterOrderBuilder } from "@/components/waiter-order-builder";
import { formatMoney } from "@/lib/money";
import { STATUS_META } from "@/lib/order-status";
import type { CategoryWithProducts, Order, OrderItem, PaymentMethod, Tab } from "@/lib/types";

type OrderWithItems = Order & { order_items: OrderItem[] };

export function TabDetail({
  tab,
  orders,
  categories,
}: {
  tab: Tab;
  orders: OrderWithItems[];
  categories: CategoryWithProducts[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [closing, setClosing] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [saving, setSaving] = useState(false);

  const activeOrders = orders.filter((o) => o.status !== "cancelado");
  const total = activeOrders.reduce((sum, o) => sum + o.total_cents, 0);
  const isOpen = tab.status === "aberta";

  async function handleCloseConfirm() {
    setSaving(true);
    try {
      await closeTab(tab.id, payment);
      router.push("/admin/mesas");
    } finally {
      setSaving(false);
    }
  }

  if (adding) {
    return (
      <div>
        <button onClick={() => setAdding(false)} className="text-accent-dark font-semibold text-sm mb-4">
          ← Voltar pra {tab.label}
        </button>
        <WaiterOrderBuilder
          tabId={tab.id}
          categories={categories}
          onDone={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/mesas" className="text-accent-dark font-semibold text-sm">
        ← Mesas e comandas
      </Link>
      <div className="flex items-center justify-between mt-3 mb-5 flex-wrap gap-2">
        <h1 className="font-display text-xl text-heading">{tab.label}</h1>
        {!isOpen && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-chip text-muted">Fechada</span>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-5">
        {activeOrders.length === 0 && (
          <p className="text-muted text-sm">Nenhum pedido ainda nessa {tab.kind === "mesa" ? "mesa" : "comanda"}.</p>
        )}
        {activeOrders.map((order) => {
          const meta = STATUS_META[order.status];
          return (
            <div key={order.id} className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
                  {meta.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-heading text-sm">{formatMoney(order.total_cents)}</span>
                  <Link
                    href={`/admin/pedidos/${order.id}/imprimir`}
                    target="_blank"
                    aria-label="Imprimir"
                    className="w-7 h-7 rounded-full bg-chip flex items-center justify-center text-accent-dark"
                  >
                    <Printer size={13} />
                  </Link>
                  {isOpen && (
                    <button
                      onClick={() => cancelOrderRound(order.id).then(() => router.refresh())}
                      aria-label="Cancelar rodada"
                      className="w-7 h-7 rounded-full bg-chip flex items-center justify-center text-[#B91C1C]"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
              <ul className="text-sm text-foreground/90 flex flex-col gap-1">
                {order.order_items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.product_name}
                  </li>
                ))}
              </ul>
              {order.notes && <p className="text-muted text-xs mt-1.5">Obs: {order.notes}</p>}
            </div>
          );
        })}
      </div>

      {isOpen && (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setAdding(true)}
            className="flex items-center justify-center gap-2 bg-accent text-accent-ink font-bold py-3 rounded-lg"
          >
            <Plus size={16} /> Adicionar pedido
          </button>

          {!closing ? (
            <button
              onClick={() => setClosing(true)}
              className="flex items-center justify-center gap-2 border-[1.5px] border-border text-foreground font-bold py-3 rounded-lg"
            >
              Fechar conta · {formatMoney(total)}
            </button>
          ) : (
            <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3">
              <div className="font-bold text-heading">Fechar conta — {formatMoney(total)}</div>
              <div className="flex gap-2 flex-wrap">
                {(["pix", "dinheiro", "cartao"] as PaymentMethod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPayment(p)}
                    className={`px-3.5 py-2 rounded-lg border-[1.5px] text-[13px] font-semibold capitalize ${
                      payment === p
                        ? "border-accent bg-accent/10 text-accent-dark"
                        : "border-border text-foreground/80"
                    }`}
                  >
                    {p === "cartao" ? "Cartão" : p}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={saving}
                  onClick={handleCloseConfirm}
                  className="flex-1 bg-accent text-accent-ink font-bold py-3 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  Confirmar fechamento
                </button>
                <button onClick={() => setClosing(false)} className="text-muted text-sm px-3">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
