export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type ProductOption = {
  id: string;
  group_id: string;
  label: string;
  price_delta_cents: number;
  sort_order: number;
};

export type ProductOptionGroup = {
  id: string;
  product_id: string;
  name: string;
  type: "single" | "multiple";
  required: boolean;
  max_select: number | null;
  sort_order: number;
  product_options: ProductOption[];
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  badge: string | null;
  available: boolean;
  featured: boolean;
  sort_order: number;
  product_option_groups: ProductOptionGroup[];
};

export type CategoryWithProducts = Category & {
  products: Product[];
};

export type StoreSettings = {
  id: number;
  name: string;
  tagline: string | null;
  whatsapp_phone: string;
  address: string | null;
  opening_hours: string | null;
  is_open: boolean;
  delivery_fee_cents: number;
  min_order_cents: number;
  logo_url: string | null;
  cover_url: string | null;
  delivery_time_estimate: string | null;
  welcome_message: string | null;
  instagram_handle: string | null;
};

export type OrderStatus =
  | "recebido"
  | "preparando"
  | "pronto"
  | "saiu_para_entrega"
  | "entregue"
  | "cancelado";

export type DeliveryType = "delivery" | "pickup";
export type PaymentMethod = "pix" | "dinheiro" | "cartao";

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: DeliveryType;
  address: string | null;
  payment_method: PaymentMethod;
  notes: string | null;
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  selected_options: Record<string, string[]> | null;
  notes: string | null;
};

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  selectedOptions: Record<string, string[]>;
};
