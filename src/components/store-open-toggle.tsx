"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toggleStoreOpen } from "@/app/admin/actions";

export function StoreOpenToggle({ initialIsOpen }: { initialIsOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [saving, setSaving] = useState(false);

  async function handleClick() {
    const next = !isOpen;
    setIsOpen(next);
    setSaving(true);
    try {
      await toggleStoreOpen(next);
    } catch {
      setIsOpen(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      className={`w-full max-w-lg flex items-center justify-between px-4 py-3 rounded-lg border-[1.5px] font-semibold text-sm transition disabled:opacity-70 ${
        isOpen ? "border-[#1F9D55] bg-[#1F9D55]/10 text-[#15803D]" : "border-[#D62828] bg-[#D62828]/10 text-[#B91C1C]"
      }`}
    >
      <span>Loja {isOpen ? "aberta" : "fechada"} para pedidos</span>
      <span className="text-xs underline flex items-center gap-1.5">
        {saving && <Loader2 size={12} className="animate-spin" />}
        {saving ? "Salvando..." : "Clique para alternar"}
      </span>
    </button>
  );
}
