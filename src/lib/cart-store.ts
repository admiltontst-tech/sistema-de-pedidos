import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

function makeKey(productId: string, selectedOptions: Record<string, string[]>) {
  const normalized = Object.entries(selectedOptions)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, labels]) => `${group}:${[...labels].sort().join(",")}`)
    .join("|");
  return `${productId}__${normalized}`;
}

type CartState = {
  items: CartItem[];
  addItem: (
    productId: string,
    name: string,
    unitPriceCents: number,
    selectedOptions?: Record<string, string[]>,
    quantity?: number
  ) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (productId, name, unitPriceCents, selectedOptions = {}, quantity = 1) =>
        set((state) => {
          const key = makeKey(productId, selectedOptions);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { key, productId, name, unitPriceCents, quantity, selectedOptions },
            ],
          };
        }),
      increment: (key) =>
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i)),
        })),
      decrement: (key) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.key === key ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        })),
      removeItem: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: "espetinho-do-beh-cart" }
  )
);

export function cartTotalCents(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
