import type { OrderStatus } from "@/lib/types";

export const STATUS_META: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  recebido: { label: "Recebido", bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]" },
  preparando: { label: "Preparando", bg: "bg-[#FEF3C7]", text: "text-[#B45309]" },
  pronto: { label: "Pronto", bg: "bg-[#D1FAE5]", text: "text-[#047857]" },
  saiu_para_entrega: { label: "Saiu para entrega", bg: "bg-[#EDE9FE]", text: "text-[#6D28D9]" },
  entregue: { label: "Entregue", bg: "bg-[#DCFCE7]", text: "text-[#15803D]" },
  cancelado: { label: "Cancelado", bg: "bg-[#FEE2E2]", text: "text-[#B91C1C]" },
};

export const OPEN_STATUSES: OrderStatus[] = [
  "recebido",
  "preparando",
  "pronto",
  "saiu_para_entrega",
];
