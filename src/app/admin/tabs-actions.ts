"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CartItem, PaymentMethod } from "@/lib/types";

export async function openTable(tableNumber: number) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("tabs")
    .select("id")
    .eq("kind", "mesa")
    .eq("table_number", tableNumber)
    .eq("status", "aberta")
    .maybeSingle();
  if (existing) return { id: existing.id as string };

  const { data, error } = await supabase
    .from("tabs")
    .insert({ kind: "mesa", table_number: tableNumber, label: `Mesa ${tableNumber}` })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Erro ao abrir mesa.");
  revalidatePath("/admin/mesas");
  return { id: data.id as string };
}

export async function openComanda(label: string) {
  const supabase = await createClient();
  const name = label.trim() || "Comanda";
  const { data, error } = await supabase
    .from("tabs")
    .insert({ kind: "comanda", label: name })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Erro ao abrir comanda.");
  revalidatePath("/admin/mesas");
  return { id: data.id as string };
}

export async function addRoundToTab(
  tabId: string,
  items: CartItem[],
  notes?: string
): Promise<{ id: string }> {
  if (items.length === 0) throw new Error("Adicione pelo menos um item.");
  const supabase = await createClient();

  const { data: tab, error: tabError } = await supabase
    .from("tabs")
    .select("id, label, status")
    .eq("id", tabId)
    .single();
  if (tabError || !tab) throw new Error("Mesa/comanda não encontrada.");
  if (tab.status !== "aberta") throw new Error("Essa mesa/comanda já foi fechada.");

  const subtotal_cents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: tab.label,
      customer_phone: "",
      delivery_type: "local",
      tab_id: tabId,
      notes: notes?.trim() || null,
      subtotal_cents,
      delivery_fee_cents: 0,
      total_cents: subtotal_cents,
    })
    .select("id")
    .single();
  if (orderError || !order) throw new Error(orderError?.message ?? "Erro ao criar pedido.");

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_name: item.name,
    unit_price_cents: item.unitPriceCents,
    quantity: item.quantity,
    selected_options: Object.keys(item.selectedOptions).length ? item.selectedOptions : null,
  }));
  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw new Error(itemsError.message);

  revalidatePath("/admin/mesas");
  revalidatePath(`/admin/mesas/${tabId}`);
  revalidatePath("/admin");
  return { id: order.id as string };
}

export async function closeTab(tabId: string, paymentMethod: PaymentMethod) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tabs")
    .update({ status: "fechada", payment_method: paymentMethod, closed_at: new Date().toISOString() })
    .eq("id", tabId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/mesas");
  revalidatePath(`/admin/mesas/${tabId}`);
}

export async function cancelOrderRound(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status: "cancelado" }).eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/mesas");
}
