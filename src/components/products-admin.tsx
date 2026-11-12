"use client";

import { useState } from "react";
import Image from "next/image";
import {
  toggleProductAvailable,
  toggleProductFeatured,
  updateProductPrice,
  createProduct,
  deleteProduct,
} from "@/app/admin/actions";
import type { CategoryWithProducts, Product } from "@/lib/types";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border transition ${
        checked
          ? "bg-accent/10 border-accent text-accent-dark"
          : "bg-surface border-border text-muted"
      }`}
    >
      {label}
    </button>
  );
}

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
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="font-display font-bold text-heading text-base">{category.name}</h2>
            <span className="text-muted text-xs font-semibold bg-chip px-2.5 py-1 rounded-full">
              {category.products.length} {category.products.length === 1 ? "item" : "itens"}
            </span>
          </div>
          <div className="flex flex-col">
            {category.products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 py-3 border-b border-border-soft last:border-b-0 flex-wrap"
              >
                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-chip">
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <span className="flex-1 min-w-[120px] text-sm font-medium text-foreground">
                  {product.name}
                </span>
                <PriceInput product={product} />
                <Toggle
                  checked={product.available}
                  onChange={(v) => toggleProductAvailable(product.id, v)}
                  label="Disponível"
                />
                <Toggle
                  checked={product.featured}
                  onChange={(v) => toggleProductFeatured(product.id, v)}
                  label="Destaque"
                />
                <button
                  onClick={() => {
                    if (confirm(`Remover "${product.name}"?`)) deleteProduct(product.id);
                  }}
                  className="text-[#B91C1C] text-xs font-semibold hover:underline"
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
