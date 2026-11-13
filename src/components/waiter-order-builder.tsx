"use client";

import { useMemo, useState } from "react";
import { X, Plus, Minus, Loader2, ShoppingCart } from "lucide-react";
import { addRoundToTab } from "@/app/admin/tabs-actions";
import { formatMoney } from "@/lib/money";
import type { CartItem, CategoryWithProducts, Product } from "@/lib/types";

function OptionsModal({
  product,
  onClose,
  onConfirm,
}: {
  product: Product;
  onClose: () => void;
  onConfirm: (name: string, priceCents: number, selected: Record<string, string[]>) => void;
}) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const priceCents = useMemo(() => {
    let total = product.price_cents;
    for (const group of product.product_option_groups) {
      const chosen = selections[group.name] ?? [];
      for (const label of chosen) {
        const opt = group.product_options.find((o) => o.label === label);
        if (opt) total += opt.price_delta_cents;
      }
    }
    return total;
  }, [selections, product]);

  const missingRequired = product.product_option_groups.filter(
    (g) => g.required && (selections[g.name] ?? []).length === 0
  );

  function pickSingle(groupName: string, label: string) {
    setSelections((s) => ({ ...s, [groupName]: [label] }));
  }

  function toggleMultiple(groupName: string, label: string, maxSelect: number | null) {
    setSelections((s) => {
      const current = s[groupName] ?? [];
      const has = current.includes(label);
      if (has) return { ...s, [groupName]: current.filter((l) => l !== label) };
      if (maxSelect && current.length >= maxSelect) return s;
      return { ...s, [groupName]: [...current, label] };
    });
  }

  function confirm() {
    if (missingRequired.length > 0) return;
    const parts = product.product_option_groups
      .filter((g) => (selections[g.name] ?? []).length > 0)
      .map((g) => `${g.name.toLowerCase()}: ${(selections[g.name] ?? []).join(", ")}`);
    const name = parts.length ? `${product.name} (${parts.join("; ")})` : product.name;
    onConfirm(name, priceCents, selections);
  }

  return (
    <div
      className="fixed inset-0 bg-[#28190a]/45 backdrop-blur-[2px] z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-[20px] border border-border w-full max-w-xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-soft">
          <h3 className="font-display font-bold text-heading text-[17px]">{product.name}</h3>
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-chip flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {product.product_option_groups.map((group) => (
            <div key={group.id}>
              <div className="flex items-center gap-2 font-bold text-[13px] text-accent-dark uppercase tracking-wide mb-2.5">
                {group.name}
                {group.required && <span className="text-[11px] font-semibold opacity-70">(obrigatório)</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.product_options.map((opt) => {
                  const selected = (selections[group.name] ?? []).includes(opt.label);
                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        group.type === "single"
                          ? pickSingle(group.name, opt.label)
                          : toggleMultiple(group.name, opt.label, group.max_select)
                      }
                      className={`px-3.5 py-2 rounded-lg border-[1.5px] text-[13px] font-semibold transition ${
                        selected
                          ? "border-accent bg-accent/10 text-accent-dark"
                          : "border-border bg-surface text-foreground/80"
                      }`}
                    >
                      {opt.label}
                      {opt.price_delta_cents > 0 && ` · +${formatMoney(opt.price_delta_cents)}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border-soft flex items-center justify-between gap-4">
          <div className="font-extrabold text-xl text-heading">{formatMoney(priceCents)}</div>
          <button
            disabled={missingRequired.length > 0}
            onClick={confirm}
            className="bg-accent text-accent-ink font-bold text-sm px-6 py-3 rounded-lg disabled:opacity-40"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

export function WaiterOrderBuilder({
  tabId,
  categories,
  onDone,
}: {
  tabId: string;
  categories: CategoryWithProducts[];
  onDone: () => void;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [builderProduct, setBuilderProduct] = useState<Product | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = cart.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);

  function addItem(key: string, name: string, unitPriceCents: number, selectedOptions: Record<string, string[]> = {}) {
    setCart((items) => {
      const existing = items.find((i) => i.key === key);
      if (existing) {
        return items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...items, { key, productId: key, name, unitPriceCents, quantity: 1, selectedOptions }];
    });
  }

  function handleAdd(product: Product) {
    if (product.product_option_groups.length > 0) {
      setBuilderProduct(product);
      return;
    }
    addItem(product.id, product.name, product.price_cents);
  }

  function increment(key: string) {
    setCart((items) => items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i)));
  }

  function decrement(key: string) {
    setCart((items) =>
      items
        .map((i) => (i.key === key ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  async function handleConfirm() {
    setSaving(true);
    setError(null);
    try {
      await addRoundToTab(tabId, cart, notes);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar pedido.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-20">
      {categories.map((category) => (
        <div key={category.id}>
          <h3 className="font-display font-bold text-heading text-sm mb-2">{category.name}</h3>
          <div className="flex flex-col gap-2">
            {category.products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleAdd(product)}
                className="flex items-center justify-between gap-3 bg-surface border border-border rounded-xl px-3.5 py-2.5 text-left"
              >
                <span className="text-sm font-medium text-foreground">{product.name}</span>
                <span className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-heading">{formatMoney(product.price_cents)}</span>
                  <Plus size={15} className="text-accent-dark" />
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {builderProduct && (
        <OptionsModal
          product={builderProduct}
          onClose={() => setBuilderProduct(null)}
          onConfirm={(name, priceCents, selected) => {
            addItem(builderProduct.id + JSON.stringify(selected), name, priceCents, selected);
            setBuilderProduct(null);
          }}
        />
      )}

      {count > 0 && !showReview && (
        <button
          onClick={() => setShowReview(true)}
          className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-[#1F9D55] text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg z-30"
        >
          <ShoppingCart size={17} />
          {count} {count === 1 ? "item" : "itens"} · {formatMoney(total)} · Revisar
        </button>
      )}

      {showReview && (
        <div
          className="fixed inset-0 bg-[#28190a]/45 backdrop-blur-[2px] z-40 flex items-end sm:items-center sm:justify-center"
          onClick={() => setShowReview(false)}
        >
          <div
            className="bg-surface rounded-t-[20px] sm:rounded-[20px] border border-border w-full sm:max-w-md max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border-soft">
              <h3 className="font-display font-bold text-heading text-[17px]">Revisar pedido</h3>
              <button
                aria-label="Fechar"
                onClick={() => setShowReview(false)}
                className="w-9 h-9 rounded-full bg-chip flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {cart.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
                    <div className="text-muted text-xs">{formatMoney(item.unitPriceCents)}</div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <button
                      onClick={() => decrement(item.key)}
                      className="w-7 h-7 rounded-full bg-chip flex items-center justify-center"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => increment(item.key)}
                      className="w-7 h-7 rounded-full bg-chip flex items-center justify-center"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <label className="text-[12.5px] font-bold text-muted uppercase mt-2">
                Observações (opcional)
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: sem cebola"
                  className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
                />
              </label>
              {error && <p className="text-[#B91C1C] text-sm">{error}</p>}
            </div>
            <div className="p-4 border-t border-border-soft">
              <button
                disabled={saving || cart.length === 0}
                onClick={handleConfirm}
                className="w-full bg-accent text-accent-ink font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Confirmar pedido · {formatMoney(total)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
