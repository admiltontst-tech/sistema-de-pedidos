"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { openTable, openComanda } from "@/app/admin/tabs-actions";
import { formatMoney } from "@/lib/money";
import type { Tab } from "@/lib/types";

type OpenTab = Tab & { total_cents: number };

function NewComandaForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { id } = await openComanda(label);
      router.push(`/admin/mesas/${id}`);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="flex items-center gap-1.5 bg-accent text-accent-ink font-bold text-sm px-4 py-2.5 rounded-lg disabled:opacity-60"
      >
        <Plus size={15} /> Nova comanda
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center">
      <input
        autoFocus
        placeholder="Nome ou identificação (ex: João, balcão 1)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm min-w-[220px]"
      />
      <button
        disabled={loading}
        className="bg-accent text-accent-ink font-bold text-sm px-4 py-2 rounded-lg disabled:opacity-60 flex items-center gap-1.5"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        Abrir
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-muted text-sm">
        Cancelar
      </button>
    </form>
  );
}

export function MesasGrid({ tableCount, openTabs }: { tableCount: number; openTabs: OpenTab[] }) {
  const router = useRouter();
  const [loadingTable, setLoadingTable] = useState<number | null>(null);

  const tablesByNumber = new Map(
    openTabs.filter((t) => t.kind === "mesa").map((t) => [t.table_number, t])
  );
  const comandas = openTabs.filter((t) => t.kind === "comanda");

  async function handleTableClick(n: number) {
    const existing = tablesByNumber.get(n);
    if (existing) {
      router.push(`/admin/mesas/${existing.id}`);
      return;
    }
    setLoadingTable(n);
    try {
      const { id } = await openTable(n);
      router.push(`/admin/mesas/${id}`);
    } finally {
      setLoadingTable(null);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="font-display font-bold text-heading text-base mb-3">Mesas</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {Array.from({ length: tableCount }, (_, i) => i + 1).map((n) => {
            const tab = tablesByNumber.get(n);
            const loading = loadingTable === n;
            return (
              <button
                key={n}
                onClick={() => handleTableClick(n)}
                disabled={loading}
                className={`relative aspect-square rounded-xl border-[1.5px] flex flex-col items-center justify-center font-display font-bold text-lg transition disabled:opacity-60 ${
                  tab
                    ? "border-accent bg-accent/10 text-accent-dark"
                    : "border-border bg-surface text-foreground/70"
                }`}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : n}
                {tab && (
                  <span className="text-[10px] font-bold text-accent-dark mt-0.5">
                    {formatMoney(tab.total_cents)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-display font-bold text-heading text-base">Comandas</h2>
          <NewComandaForm disabled={false} />
        </div>
        {comandas.length === 0 ? (
          <p className="text-muted text-sm">Nenhuma comanda aberta no momento.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {comandas.map((tab) => (
              <button
                key={tab.id}
                onClick={() => router.push(`/admin/mesas/${tab.id}`)}
                className="flex items-center justify-between bg-surface border border-accent/40 rounded-xl p-3.5 text-left"
              >
                <span className="font-semibold text-foreground text-sm">{tab.label}</span>
                <span className="font-bold text-accent-dark text-sm">
                  {formatMoney(tab.total_cents)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
