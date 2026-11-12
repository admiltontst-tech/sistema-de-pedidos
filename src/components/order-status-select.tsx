"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions";
import type { OrderStatus } from "@/lib/types";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "recebido", label: "Recebido" },
  { value: "preparando", label: "Preparando" },
  { value: "pronto", label: "Pronto" },
  { value: "saiu_para_entrega", label: "Saiu para entrega" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        startTransition(() => {
          updateOrderStatus(orderId, next);
        });
      }}
      className="bg-chip border border-chip-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#5A3E28] disabled:opacity-50"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
