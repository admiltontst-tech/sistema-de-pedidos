import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { OrderStatusSelect } from "@/components/order-status-select";
import { formatMoney } from "@/lib/money";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return <p className="text-[#B91C1C]">Erro ao carregar pedidos: {error.message}</p>;
  }

  const list = (orders ?? []) as Order[];

  return (
    <div>
      <h1 className="font-display text-xl text-heading mb-5">Pedidos</h1>
      {list.length === 0 ? (
        <p className="text-muted text-sm">Nenhum pedido ainda.</p>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted text-xs uppercase border-b border-border-soft">
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((order) => (
                <tr key={order.id} className="border-b border-border-soft last:border-b-0">
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{order.customer_name}</div>
                    <div className="text-muted text-xs">{order.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatMoney(order.total_cents)}</td>
                  <td className="px-4 py-3 text-muted">
                    {order.delivery_type === "delivery" ? "Entrega" : "Retirada"}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect orderId={order.id} status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
