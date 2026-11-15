"use client";

import { useRef, useState } from "react";
import { Flame, ImagePlus, Loader2, Pencil, X } from "lucide-react";
import { updateStoreSettings } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import type { StoreSettings } from "@/lib/types";

async function uploadPromoImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `promo/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file);
  if (error) throw new Error(`Falha ao enviar imagem: ${error.message}`);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [form, setForm] = useState({
    name: settings.name,
    tagline: settings.tagline ?? "",
    whatsapp_phone: settings.whatsapp_phone,
    address: settings.address ?? "",
    opening_hours: settings.opening_hours ?? "",
    delivery_fee: (settings.delivery_fee_cents / 100).toFixed(2),
    min_order: (settings.min_order_cents / 100).toFixed(2),
    delivery_time_estimate: settings.delivery_time_estimate ?? "",
    welcome_message: settings.welcome_message ?? "",
    instagram_handle: settings.instagram_handle ?? "",
    promo_active: settings.promo_active,
    promo_title: settings.promo_title ?? "",
    promo_description: settings.promo_description ?? "",
    promo_image_url: settings.promo_image_url,
    table_count: String(settings.table_count),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPromoImage, setUploadingPromoImage] = useState(false);
  const promoFileInputRef = useRef<HTMLInputElement>(null);

  async function handlePromoImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, promo_image_url: URL.createObjectURL(file) }));
    setUploadingPromoImage(true);
    try {
      const url = await uploadPromoImage(file);
      setForm((f) => ({ ...f, promo_image_url: url }));
    } finally {
      setUploadingPromoImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await updateStoreSettings({
      name: form.name,
      tagline: form.tagline,
      whatsapp_phone: form.whatsapp_phone,
      address: form.address,
      opening_hours: form.opening_hours,
      delivery_fee_cents: Math.round(parseFloat(form.delivery_fee || "0") * 100),
      min_order_cents: Math.round(parseFloat(form.min_order || "0") * 100),
      delivery_time_estimate: form.delivery_time_estimate,
      welcome_message: form.welcome_message,
      instagram_handle: form.instagram_handle,
      promo_active: form.promo_active,
      promo_title: form.promo_title,
      promo_description: form.promo_description,
      promo_image_url: form.promo_image_url,
      table_count: Math.max(1, Math.round(parseFloat(form.table_count || "0") || 0)),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-2xl p-6 max-w-lg flex flex-col gap-4"
    >
      <div className="border-[1.5px] border-accent/40 bg-accent/5 rounded-xl p-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, promo_active: !f.promo_active }))}
          className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-bold text-sm transition ${
            form.promo_active
              ? "bg-accent text-accent-ink"
              : "bg-chip text-muted border border-chip-border"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Flame size={15} /> Promoção {form.promo_active ? "ativa no site" : "desativada"}
          </span>
          <span className="text-xs underline">Clique para alternar</span>
        </button>
        <label className="text-[12.5px] font-bold text-muted uppercase">
          Título da promoção
          <input
            value={form.promo_title}
            onChange={(e) => setForm((f) => ({ ...f, promo_title: e.target.value }))}
            placeholder="Ex: Quarta do Baião!"
            className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
          />
        </label>
        <label className="text-[12.5px] font-bold text-muted uppercase">
          Regras / descrição
          <textarea
            value={form.promo_description}
            onChange={(e) => setForm((f) => ({ ...f, promo_description: e.target.value }))}
            rows={3}
            placeholder="Ex: Compre 2 espetinhos e ganhe um baião P! Só hoje, até durar o estoque."
            className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground resize-none"
          />
        </label>

        <div>
          <span className="text-[12.5px] font-bold text-muted uppercase block mb-1.5">
            Foto do banner (opcional)
          </span>
          <input
            type="file"
            accept="image/*"
            ref={promoFileInputRef}
            onChange={handlePromoImageChange}
            className="hidden"
          />
          {form.promo_image_url ? (
            <div className="relative w-full rounded-lg overflow-hidden bg-chip group flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.promo_image_url}
                alt="Banner da promoção"
                className="max-h-[420px] w-auto h-auto"
              />
              <button
                type="button"
                onClick={() => promoFileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Trocar foto do banner"
              >
                {uploadingPromoImage ? (
                  <Loader2 size={18} className="text-white animate-spin" />
                ) : (
                  <Pencil size={16} className="text-white" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, promo_image_url: null }))}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition"
                aria-label="Remover foto do banner"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => promoFileInputRef.current?.click()}
              className="w-full h-32 rounded-lg border-2 border-dashed border-accent/40 bg-surface flex flex-col items-center justify-center gap-1.5 text-muted hover:border-accent/70 transition"
            >
              {uploadingPromoImage ? (
                <Loader2 size={18} className="animate-spin text-accent-dark" />
              ) : (
                <>
                  <ImagePlus size={18} className="text-accent-dark" />
                  <span className="text-xs font-semibold">Adicionar foto do banner</span>
                </>
              )}
            </button>
          )}
          <p className="text-muted text-[11px] mt-1.5">
            Pode ser uma arte vertical completa (tipo as que vocês já fazem pra Instagram/WhatsApp)
            — ela aparece inteira no site, sem cortar. Se adicionar uma foto, ela substitui a barra
            de texto. Sem foto, continua aparecendo só o texto acima.
          </p>
        </div>

        <p className="text-muted text-xs">
          Quando ativa, aparece em destaque no topo do site. Desative quando a promoção acabar.
        </p>
      </div>

      <label className="text-[12.5px] font-bold text-muted uppercase">
        Nome da loja
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
        />
      </label>
      <label className="text-[12.5px] font-bold text-muted uppercase">
        Frase (tagline)
        <input
          value={form.tagline}
          onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
          className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
        />
      </label>
      <label className="text-[12.5px] font-bold text-muted uppercase">
        WhatsApp (só números, com DDI+DDD)
        <input
          value={form.whatsapp_phone}
          onChange={(e) => setForm((f) => ({ ...f, whatsapp_phone: e.target.value }))}
          className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
        />
      </label>
      <label className="text-[12.5px] font-bold text-muted uppercase">
        Instagram (só o usuário, sem @)
        <input
          value={form.instagram_handle}
          onChange={(e) => setForm((f) => ({ ...f, instagram_handle: e.target.value }))}
          placeholder="espetinhodobeh"
          className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
        />
      </label>
      <label className="text-[12.5px] font-bold text-muted uppercase">
        Endereço
        <input
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
        />
      </label>
      <label className="text-[12.5px] font-bold text-muted uppercase">
        Horário de funcionamento
        <input
          value={form.opening_hours}
          onChange={(e) => setForm((f) => ({ ...f, opening_hours: e.target.value }))}
          className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
        />
      </label>
      <label className="text-[12.5px] font-bold text-muted uppercase">
        Tempo estimado de entrega
        <input
          value={form.delivery_time_estimate}
          onChange={(e) => setForm((f) => ({ ...f, delivery_time_estimate: e.target.value }))}
          placeholder="Ex: 40-60 min"
          className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
        />
      </label>
      <label className="text-[12.5px] font-bold text-muted uppercase">
        Mensagem de boas-vindas
        <textarea
          value={form.welcome_message}
          onChange={(e) => setForm((f) => ({ ...f, welcome_message: e.target.value }))}
          rows={3}
          className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground resize-none"
        />
      </label>
      <div className="flex gap-4">
        <label className="text-[12.5px] font-bold text-muted uppercase flex-1">
          Taxa de entrega (R$)
          <input
            value={form.delivery_fee}
            onChange={(e) => setForm((f) => ({ ...f, delivery_fee: e.target.value }))}
            className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
          />
        </label>
        <label className="text-[12.5px] font-bold text-muted uppercase flex-1">
          Pedido mínimo (R$)
          <input
            value={form.min_order}
            onChange={(e) => setForm((f) => ({ ...f, min_order: e.target.value }))}
            className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
          />
        </label>
      </div>
      <label className="text-[12.5px] font-bold text-muted uppercase">
        Número de mesas do salão
        <input
          type="number"
          min={1}
          value={form.table_count}
          onChange={(e) => setForm((f) => ({ ...f, table_count: e.target.value }))}
          className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
        />
        <span className="block text-muted text-[11px] font-normal normal-case mt-1">
          Define quantas mesas aparecem na aba Mesas, usada pelo garçom.
        </span>
      </label>

      <button
        disabled={saving}
        className="bg-accent text-accent-ink font-bold py-3 rounded-lg disabled:opacity-60 mt-2"
      >
        {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar alterações"}
      </button>
    </form>
  );
}
