"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions";
import { STATUS_META } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

const OPTIONS = Object.keys(STATUS_META) as OrderStatus[];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [isPending, startTransition] = useTransition();
  const meta = STATUS_META[status];

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
      className={`${meta.bg} ${meta.text} border-none rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-50 cursor-pointer appearance-none text-center`}
    >
      {OPTIONS.map((value) => (
        <option key={value} value={value}>
          {STATUS_META[value].label}
        </option>
      ))}
    </select>
  );
}
