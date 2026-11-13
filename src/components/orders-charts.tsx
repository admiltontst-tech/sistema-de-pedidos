"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import type { Order } from "@/lib/types";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type DayBar = { label: string; isToday: boolean; value: number };

function lastNDays(n: number): Date[] {
  const days: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function BarChart({
  title,
  data,
  formatValue,
}: {
  title: string;
  data: DayBar[];
  formatValue: (v: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const maxIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);

  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <h3 className="font-display font-bold text-heading text-sm mb-4">{title}</h3>
      <div className="flex items-end gap-1.5 sm:gap-2 h-[140px] relative border-b border-border-soft">
        {data.map((d, i) => {
          const heightPct = Math.max((d.value / max) * 100, 2);
          const showLabel = hover === i || i === maxIndex || d.isToday;
          return (
            <button
              key={i}
              type="button"
              className="flex-1 flex flex-col items-center justify-end h-full relative outline-none"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => setHover(hover === i ? null : i)}
              aria-label={`${d.label}: ${formatValue(d.value)}`}
            >
              <span
                className={`text-[10px] font-bold mb-1.5 whitespace-nowrap transition-opacity ${
                  showLabel ? "opacity-100" : "opacity-0"
                } ${d.isToday ? "text-accent-dark" : "text-muted"}`}
              >
                {formatValue(d.value)}
              </span>
              <span
                className={`w-full max-w-[22px] rounded-t-[4px] transition-opacity ${
                  d.isToday ? "bg-accent-dark" : "bg-accent"
                } ${hover !== null && hover !== i ? "opacity-50" : "opacity-100"}`}
                style={{ height: `${heightPct}%` }}
              />
            </button>
          );
        })}
      </div>
      <div className="flex gap-1.5 sm:gap-2 mt-1.5">
        {data.map((d, i) => (
          <div
            key={i}
            className={`flex-1 text-center text-[9.5px] font-semibold truncate ${
              d.isToday ? "text-accent-dark" : "text-muted"
            }`}
          >
            {d.isToday ? "Hoje" : d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrdersCharts({ orders }: { orders: Order[] }) {
  const days = lastNDays(7);

  const revenueData: DayBar[] = days.map((day) => {
    const dayOrders = orders.filter(
      (o) => sameDay(new Date(o.created_at), day) && o.status !== "cancelado"
    );
    const value = dayOrders.reduce((sum, o) => sum + o.total_cents, 0);
    return { label: `${WEEKDAYS[day.getDay()]} ${day.getDate()}`, isToday: sameDay(day, new Date()), value };
  });

  const countData: DayBar[] = days.map((day) => {
    const dayOrders = orders.filter((o) => sameDay(new Date(o.created_at), day));
    return {
      label: `${WEEKDAYS[day.getDay()]} ${day.getDate()}`,
      isToday: sameDay(day, new Date()),
      value: dayOrders.length,
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-7">
      <BarChart title="Faturamento — últimos 7 dias" data={revenueData} formatValue={(v) => formatMoney(v)} />
      <BarChart
        title="Pedidos — últimos 7 dias"
        data={countData}
        formatValue={(v) => `${v} ${v === 1 ? "pedido" : "pedidos"}`}
      />
    </div>
  );
}
