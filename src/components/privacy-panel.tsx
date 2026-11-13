"use client";

import { useState } from "react";
import { Search, Download, Trash2, Loader2 } from "lucide-react";
import { searchCustomerData, deleteOrdersPermanently } from "@/app/admin/actions";
import { formatMoney } from "@/lib/money";
import { paymentLabel } from "@/lib/order-status";
import type { Order, OrderItem } from "@/lib/types";

type OrderWithItems = Order & { order_items: OrderItem[] };

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PrivacyPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OrderWithItems[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const data = await searchCustomerData(query);
      setResults(data);
      setSelected(new Set(data.map((o) => o.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar.");
    } finally {
      setSearching(false);
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleExport() {
    if (!results) return;
    const selectedOrders = results.filter((o) => selected.has(o.id));
    downloadJson(`dados-cliente-${Date.now()}.json`, selectedOrders);
  }

  async function handleDelete() {
    if (selected.size === 0) return;
    if (
      !confirm(
        `Excluir definitivamente ${selected.size} pedido(s) e todos os dados desse cliente? Essa ação não pode ser desfeita.`
      )
    )
      return;
    setDeleting(true);
    setError(null);
    try {
      await deleteOrdersPermanently(Array.from(selected));
      setResults((prev) => (prev ?? []).filter((o) => !selected.has(o.id)));
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque por nome ou telefone do cliente"
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm"
        />
        <button
          disabled={searching}
          className="bg-accent text-accent-ink font-bold text-sm px-4 py-2.5 rounded-lg disabled:opacity-60 flex items-center gap-1.5"
        >
          {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Buscar
        </button>
      </form>

      {error && <p className="text-[#B91C1C] text-sm">{error}</p>}

      {results !== null && (
        <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3.5">
          {results.length === 0 ? (
            <p className="text-muted text-sm">Nenhum pedido encontrado para essa busca.</p>
          ) : (
            <>
              <p className="text-muted text-sm">
                {results.length} pedido(s) encontrado(s). Marque os que pertencem ao cliente e
                exporte ou exclua os dados.
              </p>
              <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                {results.map((order) => (
                  <label
                    key={order.id}
                    className="flex items-start gap-3 border border-border-soft rounded-xl p-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggle(order.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 text-sm">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-heading">
                          #{order.id.slice(0, 8)} — {order.customer_name}
                        </span>
                        <span className="text-muted text-xs">
                          {new Date(order.created_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="text-muted text-xs mt-0.5">
                        {order.customer_phone} ·{" "}
                        {order.delivery_type === "delivery"
                          ? order.address ?? "Entrega"
                          : "Retirada"}{" "}
                        · {paymentLabel(order.payment_method)} ·{" "}
                        {formatMoney(order.total_cents)}
                      </div>
                      <ul className="text-xs text-foreground/80 mt-1.5 list-disc pl-4">
                        {order.order_items.map((item) => (
                          <li key={item.id}>
                            {item.quantity}x {item.product_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={handleExport}
                  disabled={selected.size === 0}
                  className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-lg border border-border bg-surface disabled:opacity-50"
                >
                  <Download size={14} /> Baixar dados ({selected.size})
                </button>
                <button
                  onClick={handleDelete}
                  disabled={selected.size === 0 || deleting}
                  className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-lg border border-[#D62828] bg-[#D62828]/10 text-[#B91C1C] disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Excluir definitivamente ({selected.size})
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
