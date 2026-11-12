"use client";

import { useState } from "react";
import {
  toggleProductAvailable,
  toggleProductFeatured,
  updateProductPrice,
  createProduct,
  deleteProduct,
} from "@/app/admin/actions";
import type { CategoryWithProducts, Product } from "@/lib/types";

function PriceInput({ product }: { product: Product }) {
  const [value, setValue] = useState((product.price_cents / 100).toFixed(2));
  const [saving, setSaving] = useState(false);

  async function save() {
    const cents = Math.round(parseFloat(value.replace(",", ".") || "0") * 100);
    if (cents === product.price_cents || Number.isNaN(cents)) return;
    setSaving(true);
    await updateProductPrice(product.id, cents);
    setSaving(false);
  }

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      disabled={saving}
      className="w-20 bg-surface border border-border rounded-md px-2 py-1 text-sm text-right"
    />
  );
}

function NewProductForm({ categoryId }: { categoryId: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setSaving(true);
    await createProduct({
      category_id: categoryId,
      name: name.trim(),
      description: description.trim(),
      price_cents: Math.round(parseFloat(price.replace(",", ".")) * 100),
    });
    setName("");
    setDescription("");
    setPrice("");
    setSaving(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-accent-dark text-sm font-semibold mt-2 hover:underline"
      >
        + Adicionar produto
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mt-2 items-center">
      <input
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-surface border border-border rounded-md px-2 py-1.5 text-sm flex-1 min-w-[140px]"
      />
      <input
        placeholder="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="bg-surface border border-border rounded-md px-2 py-1.5 text-sm flex-1 min-w-[160px]"
      />
      <input
        placeholder="Preço"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-20 bg-surface border border-border rounded-md px-2 py-1.5 text-sm"
      />
      <button
        disabled={saving}
        className="bg-accent text-accent-ink font-semibold text-sm px-3 py-1.5 rounded-md disabled:opacity-60"
      >
        Salvar
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-muted text-sm">
        Cancelar
      </button>
    </form>
  );
}

export function ProductsAdmin({ categories }: { categories: CategoryWithProducts[] }) {
  return (
    <div className="flex flex-col gap-6">
      {categories.map((category) => (
        <div key={category.id} className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-bold text-heading mb-3">{category.name}</h2>
          <div className="flex flex-col">
            {category.products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 py-2.5 border-b border-border-soft last:border-b-0"
              >
                <span className="flex-1 text-sm text-foreground">{product.name}</span>
                <PriceInput product={product} />
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input
                    type="checkbox"
                    defaultChecked={product.available}
                    onChange={(e) => toggleProductAvailable(product.id, e.target.checked)}
                  />
                  Disponível
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input
                    type="checkbox"
                    defaultChecked={product.featured}
                    onChange={(e) => toggleProductFeatured(product.id, e.target.checked)}
                  />
                  Destaque
                </label>
                <button
                  onClick={() => {
                    if (confirm(`Remover "${product.name}"?`)) deleteProduct(product.id);
                  }}
                  className="text-[#B91C1C] text-xs font-semibold"
                >
                  Remover
                </button>
              </div>
            ))}
            {category.products.length === 0 && (
              <p className="text-muted text-sm py-2">Nenhum produto nessa categoria ainda.</p>
            )}
          </div>
          <NewProductForm categoryId={category.id} />
        </div>
      ))}
    </div>
  );
}
