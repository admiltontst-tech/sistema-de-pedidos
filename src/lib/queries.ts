import { createClient } from "@/lib/supabase/server";
import type { CategoryWithProducts, Order, OrderItem, StoreSettings } from "@/lib/types";

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw new Error(`Falha ao carregar configurações da loja: ${error?.message}`);
  }

  return data;
}

export async function getMenu(): Promise<CategoryWithProducts[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id, name, slug, sort_order,
      products:products (
        id, category_id, name, description, price_cents, image_url, badge, available, featured, sort_order,
        product_option_groups:product_option_groups (
          id, product_id, name, type, required, max_select, sort_order,
          product_options:product_options ( id, group_id, label, price_delta_cents, sort_order )
        )
      )
    `
    )
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Falha ao carregar o cardápio: ${error.message}`);
  }

  const categories = (data ?? []) as unknown as CategoryWithProducts[];

  for (const category of categories) {
    category.products = (category.products ?? [])
      .filter((p) => p.available)
      .sort((a, b) => a.sort_order - b.sort_order);

    for (const product of category.products) {
      product.product_option_groups = (product.product_option_groups ?? []).sort(
        (a, b) => a.sort_order - b.sort_order
      );
      for (const group of product.product_option_groups) {
        group.product_options = (group.product_options ?? []).sort(
          (a, b) => a.sort_order - b.sort_order
        );
      }
    }
  }

  return categories.sort((a, b) => a.sort_order - b.sort_order);
}

export async function getOrderWithItems(
  orderId: string
): Promise<{ order: Order; items: OrderItem[] } | null> {
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) {
    throw new Error(`Falha ao carregar itens do pedido: ${itemsError.message}`);
  }

  return { order, items: items ?? [] };
}
