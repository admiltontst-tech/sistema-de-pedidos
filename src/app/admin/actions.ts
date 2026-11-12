"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function updateStoreSettings(data: {
  name: string;
  tagline: string;
  whatsapp_phone: string;
  address: string;
  opening_hours: string;
  is_open: boolean;
  delivery_fee_cents: number;
  min_order_cents: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("store_settings").update(data).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/configuracoes");
  revalidatePath("/");
}

export async function toggleProductAvailable(productId: string, available: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ available }).eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function toggleProductFeatured(productId: string, featured: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ featured }).eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function updateProductPrice(productId: string, priceCents: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ price_cents: priceCents })
    .eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function createProduct(data: {
  category_id: string;
  name: string;
  description: string;
  price_cents: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    category_id: data.category_id,
    name: data.name,
    description: data.description || null,
    price_cents: data.price_cents,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
