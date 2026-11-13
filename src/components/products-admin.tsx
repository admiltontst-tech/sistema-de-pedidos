"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil } from "lucide-react";
import {
  toggleProductAvailable,
  toggleProductFeatured,
  updateProductPrice,
  updateProductImage,
  createProduct,
  deleteProduct,
} from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import type { CategoryWithProducts, Product } from "@/lib/types";

async function uploadProductImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file);
  if (error) throw new Error(`Falha ao enviar imagem: ${error.message}`);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

function ProductThumb({ product }: { product: Product }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      await updateProductImage(product.id, url);
    } finally {
      setUploading(false);
    }
  }

  const src = preview ?? product.image_url;

  return (
    <button
      type="button"
      onClick={() => fileInputRef.current?.click()}
      className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-chip group"
      aria-label={`Trocar foto de ${product.name}`}
      title="Clique para trocar a foto"
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImagePlus size={14} className="text-accent-dark" />
        </div>
      )}
      <div
        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
          uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {uploading ? (
          <Loader2 size={14} className="text-white animate-spin" />
        ) : (
          <Pencil size={13} className="text-white" />
        )}
      </div>
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  uncheckedLabel,
  tone = "accent",
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  uncheckedLabel?: string;
  tone?: "accent" | "green";
}) {
  const checkedClass =
    tone === "green"
      ? "bg-[#1F9D55]/10 border-[#1F9D55] text-[#15803D]"
      : "bg-accent/10 border-accent text-accent-dark";
  const uncheckedClass =
    tone === "green" ? "bg-[#D62828]/10 border-[#D62828] text-[#B91C1C]" : "bg-surface border-border text-muted";

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border transition ${
        checked ? checkedClass : uncheckedClass
      }`}
    >
      {checked ? label : uncheckedLabel ?? label}
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
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setError(null);
    setSaving(true);
    try {
      let image_url: string | undefined;
      if (imageFile) {
        setUploading(true);
        image_url = await uploadProductImage(imageFile);
        setUploading(false);
      }
      await createProduct({
        category_id: categoryId,
        name: name.trim(),
        description: description.trim(),
        price_cents: Math.round(parseFloat(price.replace(",", ".")) * 100),
        image_url,
      });
      setName("");
      setDescription("");
      setPrice("");
      setImageFile(null);
      setImagePreview(null);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar produto.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
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
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-9 h-9 rounded-md bg-chip border border-chip-border flex items-center justify-center flex-shrink-0 overflow-hidden"
        aria-label="Escolher foto"
      >
        {imagePreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagePreview} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImagePlus size={16} className="text-accent-dark" />
        )}
      </button>
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
        className="bg-accent text-accent-ink font-semibold text-sm px-3 py-1.5 rounded-md disabled:opacity-60 flex items-center gap-1.5"
      >
        {uploading && <Loader2 size={13} className="animate-spin" />}
        {uploading ? "Enviando foto..." : saving ? "Salvando..." : "Salvar"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-muted text-sm">
        Cancelar
      </button>
      {error && <p className="text-[#B91C1C] text-xs w-full">{error}</p>}
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
                <ProductThumb product={product} />
                <span className="flex-1 min-w-[120px] text-sm font-medium text-foreground">
                  {product.name}
                </span>
                <PriceInput product={product} />
                <Toggle
                  checked={product.available}
                  onChange={(v) => toggleProductAvailable(product.id, v)}
                  label="Disponível"
                  uncheckedLabel="Indisponível"
                  tone="green"
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
