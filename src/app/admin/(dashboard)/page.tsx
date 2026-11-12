import { ClipboardList, Wallet, Flame, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { OrderStatusSelect } from "@/components/order-status-select";
import { formatMoney } from "@/lib/money";
import { OPEN_STATUSES } from "@/lib/order-status";

export const revalidate = 0;

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-chip flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-accent-dark" />
      </div>
      <div>
        <div className="text-muted text-xs font-semibold">{label}</div>
        <div className="font-display font-bold text-heading text-lg leading-tight">{value}</div>
      </div>
    </div>
  );
}

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
  const today = new Date().toDateString();
  const todayOrders = list.filter((o) => new Date(o.created_at).toDateString() === today);
  const todayRevenue = todayOrders
    .filter((o) => o.status !== "cancelado")
    .reduce((sum, o) => sum + o.total_cents, 0);
  const openOrders = list.filter((o) => OPEN_STATUSES.includes(o.status));

  return (
    <div>
      <h1 className="font-display text-xl text-heading mb-5">Pedidos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-7">
        <StatCard icon={ClipboardList} label="Pedidos hoje" value={String(todayOrders.length)} />
        <StatCard icon={Wallet} label="Faturamento hoje" value={formatMoney(todayRevenue)} />
        <StatCard icon={Flame} label="Em aberto" value={String(openOrders.length)} />
      </div>

      {list.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl py-16 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-chip flex items-center justify-center">
            <Inbox size={24} className="text-accent-dark" />
          </div>
          <p className="text-muted text-sm">Nenhum pedido ainda — assim que alguém pedir, aparece aqui.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((order) => (
            <div
              key={order.id}
              className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 flex-wrap"
            >
              <div className="font-mono text-xs text-muted w-20 flex-shrink-0">
                #{order.id.slice(0, 8)}
              </div>
              <div className="flex-1 min-w-[140px]">
                <div className="font-semibold text-foreground text-sm">{order.customer_name}</div>
                <div className="text-muted text-xs">{order.customer_phone}</div>
              </div>
              <div className="text-muted text-xs font-semibold px-2.5 py-1 bg-chip rounded-full">
                {order.delivery_type === "delivery" ? "Entrega" : "Retirada"}
              </div>
              <div className="font-bold text-heading text-sm w-24 text-right">
                {formatMoney(order.total_cents)}
              </div>
              <OrderStatusSelect orderId={order.id} status={order.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
