"use server";

import { createClient } from "@/lib/supabase/server";
import type { CartItem, DeliveryType, PaymentMethod } from "@/lib/types";

type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  address?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: CartItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
};

export async function createOrder(input: CreateOrderInput) {
  if (!input.customerName.trim() || !input.customerPhone.trim()) {
    throw new Error("Nome e telefone são obrigatórios.");
  }
  if (input.deliveryType === "delivery" && !input.address?.trim()) {
    throw new Error("Endereço é obrigatório para entrega.");
  }
  if (input.items.length === 0) {
    throw new Error("O carrinho está vazio.");
  }

  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone.trim(),
      delivery_type: input.deliveryType,
      address: input.address?.trim() || null,
      payment_method: input.paymentMethod,
      notes: input.notes?.trim() || null,
      subtotal_cents: input.subtotalCents,
      delivery_fee_cents: input.deliveryFeeCents,
      total_cents: input.subtotalCents + input.deliveryFeeCents,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(`Não foi possível criar o pedido: ${orderError?.message}`);
  }

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_name: item.name,
    unit_price_cents: item.unitPriceCents,
    quantity: item.quantity,
    selected_options: Object.keys(item.selectedOptions).length ? item.selectedOptions : null,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    throw new Error(`Não foi possível salvar os itens do pedido: ${itemsError.message}`);
  }

  return { id: order.id as string };
}
