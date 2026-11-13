"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import { updateStoreSettings } from "@/app/admin/actions";
import type { StoreSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [form, setForm] = useState({
    name: settings.name,
    tagline: settings.tagline ?? "",
    whatsapp_phone: settings.whatsapp_phone,
    address: settings.address ?? "",
    opening_hours: settings.opening_hours ?? "",
    is_open: settings.is_open,
    delivery_fee: (settings.delivery_fee_cents / 100).toFixed(2),
    min_order: (settings.min_order_cents / 100).toFixed(2),
    delivery_time_estimate: settings.delivery_time_estimate ?? "",
    welcome_message: settings.welcome_message ?? "",
    instagram_handle: settings.instagram_handle ?? "",
    promo_active: settings.promo_active,
    promo_title: settings.promo_title ?? "",
    promo_description: settings.promo_description ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      is_open: form.is_open,
      delivery_fee_cents: Math.round(parseFloat(form.delivery_fee || "0") * 100),
      min_order_cents: Math.round(parseFloat(form.min_order || "0") * 100),
      delivery_time_estimate: form.delivery_time_estimate,
      welcome_message: form.welcome_message,
      instagram_handle: form.instagram_handle,
      promo_active: form.promo_active,
      promo_title: form.promo_title,
      promo_description: form.promo_description,
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-2xl p-6 max-w-lg flex flex-col gap-4"
    >
      <button
        type="button"
        onClick={() => setForm((f) => ({ ...f, is_open: !f.is_open }))}
        className={`flex items-center justify-between px-4 py-3 rounded-lg border-[1.5px] font-semibold text-sm ${
          form.is_open ? "border-[#1F9D55] bg-[#1F9D55]/10 text-[#15803D]" : "border-[#D62828] bg-[#D62828]/10 text-[#B91C1C]"
        }`}
      >
        <span>Loja {form.is_open ? "aberta" : "fechada"} para pedidos</span>
        <span className="text-xs underline">Clique para alternar</span>
      </button>

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

      <button
        disabled={saving}
        className="bg-accent text-accent-ink font-bold py-3 rounded-lg disabled:opacity-60 mt-2"
      >
        {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar alterações"}
      </button>
    </form>
  );
}
