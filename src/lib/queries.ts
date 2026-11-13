import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CategoryWithProducts, Order, OrderItem, StoreSettings, Tab } from "@/lib/types";

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

export async function getMenuForAdmin(): Promise<CategoryWithProducts[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id, name, slug, sort_order,
      products:products ( id, category_id, name, description, price_cents, image_url, badge, available, featured, sort_order, product_option_groups:product_option_groups(id,product_id,name,type,required,max_select,sort_order,product_options:product_options(id,group_id,label,price_delta_cents,sort_order)) )
    `
    )
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Falha ao carregar o cardápio: ${error.message}`);
  }

  const categories = (data ?? []) as unknown as CategoryWithProducts[];
  for (const category of categories) {
    category.products = (category.products ?? []).sort((a, b) => a.sort_order - b.sort_order);
  }
  return categories.sort((a, b) => a.sort_order - b.sort_order);
}

export async function getOrderWithItems(
  orderId: string
): Promise<{ order: Order; items: OrderItem[] } | null> {
  // Usa a service_role key: o cliente acessa o pedido pelo link que recebeu
  // (uuid aleatório, não listável), e a RLS pública não permite mais leitura
  // de pedidos — então o servidor busca com privilégio elevado.
  const supabase = createAdminClient();

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

export async function getOpenTabs(): Promise<(Tab & { total_cents: number })[]> {
  const supabase = await createClient();
  const { data: tabs, error } = await supabase
    .from("tabs")
    .select("*, orders(total_cents, status)")
    .eq("status", "aberta")
    .order("opened_at", { ascending: true });
  if (error) throw new Error(error.message);

  return (tabs ?? []).map(({ orders, ...tab }) => {
    const total_cents = (orders as { total_cents: number; status: string }[])
      .filter((o) => o.status !== "cancelado")
      .reduce((sum, o) => sum + o.total_cents, 0);
    return { ...(tab as Tab), total_cents };
  });
}

export async function getTabWithOrders(
  tabId: string
): Promise<{ tab: Tab; orders: (Order & { order_items: OrderItem[] })[] } | null> {
  const supabase = await createClient();
  const { data: tab, error: tabError } = await supabase
    .from("tabs")
    .select("*")
    .eq("id", tabId)
    .single();
  if (tabError || !tab) return null;

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("tab_id", tabId)
    .order("created_at", { ascending: true });
  if (ordersError) throw new Error(ordersError.message);

  return { tab, orders: (orders ?? []) as (Order & { order_items: OrderItem[] })[] };
}
