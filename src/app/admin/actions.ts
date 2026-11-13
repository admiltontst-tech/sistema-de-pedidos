"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "categoria"
  );
}

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
  delivery_time_estimate: string;
  welcome_message: string;
  instagram_handle: string;
  promo_active: boolean;
  promo_title: string;
  promo_description: string;
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

export async function updateProductImage(productId: string, imageUrl: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ image_url: imageUrl })
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
  image_url?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    category_id: data.category_id,
    name: data.name,
    description: data.description || null,
    price_cents: data.price_cents,
    image_url: data.image_url || null,
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

export async function createCategory(name: string) {
  const supabase = await createClient();
  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
  const { data: maxRow } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? 0) + 1;
  const { error } = await supabase.from("categories").insert({ name, slug, sort_order });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function renameCategory(categoryId: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ name }).eq("id", categoryId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if (count && count > 0) {
    throw new Error(
      `Essa categoria tem ${count} produto(s). Remova ou mova os produtos antes de excluir a categoria.`
    );
  }
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function createOptionGroup(data: {
  product_id: string;
  name: string;
  type: "single" | "multiple";
  required: boolean;
  max_select: number | null;
}) {
  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("product_option_groups")
    .select("sort_order")
    .eq("product_id", data.product_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("product_option_groups").insert({ ...data, sort_order });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function updateOptionGroup(
  groupId: string,
  data: { name: string; type: "single" | "multiple"; required: boolean; max_select: number | null }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_option_groups").update(data).eq("id", groupId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function deleteOptionGroup(groupId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_option_groups").delete().eq("id", groupId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function createOption(data: {
  group_id: string;
  label: string;
  price_delta_cents: number;
}) {
  const supabase = await createClient();
  const { data: maxRow } = await supabase
    .from("product_options")
    .select("sort_order")
    .eq("group_id", data.group_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("product_options").insert({ ...data, sort_order });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function updateOption(
  optionId: string,
  data: { label: string; price_delta_cents: number }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_options").update(data).eq("id", optionId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}

export async function deleteOption(optionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_options").delete().eq("id", optionId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produtos");
  revalidatePath("/");
}
