"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import {
  createOptionGroup,
  updateOptionGroup,
  deleteOptionGroup,
  createOption,
  updateOption,
  deleteOption,
} from "@/app/admin/actions";
import type { Product, ProductOptionGroup, ProductOption } from "@/lib/types";

function OptionRow({ option }: { option: ProductOption }) {
  const [label, setLabel] = useState(option.label);
  const [price, setPrice] = useState((option.price_delta_cents / 100).toFixed(2));

  async function saveLabel() {
    if (label.trim() === option.label) return;
    await updateOption(option.id, {
      label: label.trim() || option.label,
      price_delta_cents: option.price_delta_cents,
    });
  }

  async function savePrice() {
    const cents = Math.round(parseFloat(price.replace(",", ".") || "0") * 100);
    if (cents === option.price_delta_cents || Number.isNaN(cents)) return;
    await updateOption(option.id, { label: option.label, price_delta_cents: cents });
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={saveLabel}
        className="flex-1 min-w-[100px] bg-surface border border-border rounded-md px-2 py-1 text-xs"
      />
      <span className="text-muted text-xs">+R$</span>
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onBlur={savePrice}
        className="w-16 bg-surface border border-border rounded-md px-2 py-1 text-xs text-right"
      />
      <button
        onClick={() => deleteOption(option.id)}
        aria-label={`Remover opção ${option.label}`}
        className="text-[#B91C1C] flex-shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  );
}

function NewOptionRow({ groupId }: { groupId: string }) {
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("0.00");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!label.trim()) return;
    setSaving(true);
    await createOption({
      group_id: groupId,
      label: label.trim(),
      price_delta_cents: Math.round(parseFloat(price.replace(",", ".") || "0") * 100),
    });
    setLabel("");
    setPrice("0.00");
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        placeholder="Nova opção"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="flex-1 min-w-[100px] bg-surface border border-dashed border-border rounded-md px-2 py-1 text-xs"
      />
      <span className="text-muted text-xs">+R$</span>
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-16 bg-surface border border-dashed border-border rounded-md px-2 py-1 text-xs text-right"
      />
      <button
        onClick={handleAdd}
        disabled={saving}
        aria-label="Adicionar opção"
        className="text-accent-dark flex-shrink-0 disabled:opacity-50"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function GroupCard({ group }: { group: ProductOptionGroup }) {
  const [name, setName] = useState(group.name);

  async function saveName() {
    if (!name.trim() || name === group.name) return;
    await updateOptionGroup(group.id, {
      name: name.trim(),
      type: group.type,
      required: group.required,
      max_select: group.max_select,
    });
  }

  async function handleDelete() {
    if (!confirm(`Remover o grupo "${group.name}" e todas as suas opções?`)) return;
    await deleteOptionGroup(group.id);
  }

  return (
    <div className="bg-chip border border-chip-border rounded-xl p-3.5 flex flex-col gap-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          className="font-bold text-sm bg-surface border border-border rounded-md px-2 py-1 flex-1 min-w-[120px]"
        />
        <button
          type="button"
          onClick={() =>
            updateOptionGroup(group.id, {
              name: group.name,
              type: group.type === "single" ? "multiple" : "single",
              required: group.required,
              max_select: group.max_select,
            })
          }
          className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-border bg-surface"
        >
          {group.type === "single" ? "Escolha única" : "Múltipla escolha"}
        </button>
        <button
          type="button"
          onClick={() =>
            updateOptionGroup(group.id, {
              name: group.name,
              type: group.type,
              required: !group.required,
              max_select: group.max_select,
            })
          }
          className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border ${
            group.required
              ? "border-accent bg-accent/10 text-accent-dark"
              : "border-border bg-surface text-muted"
          }`}
        >
          Obrigatório
        </button>
        {group.type === "multiple" && (
          <label className="flex items-center gap-1.5 text-xs text-muted">
            Máx.
            <input
              type="number"
              min={1}
              defaultValue={group.max_select ?? ""}
              onBlur={(e) =>
                updateOptionGroup(group.id, {
                  name: group.name,
                  type: group.type,
                  required: group.required,
                  max_select: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
              className="w-14 bg-surface border border-border rounded-md px-1.5 py-1 text-xs"
            />
          </label>
        )}
        <button
          onClick={handleDelete}
          aria-label={`Excluir grupo ${group.name}`}
          className="text-[#B91C1C] ml-auto"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex flex-col gap-1.5 pl-1">
        {group.product_options.map((opt) => (
          <OptionRow key={opt.id} option={opt} />
        ))}
        <NewOptionRow groupId={group.id} />
      </div>
    </div>
  );
}

function NewGroupForm({ productId }: { productId: string }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!name.trim()) return;
    setSaving(true);
    await createOptionGroup({
      product_id: productId,
      name: name.trim(),
      type: "single",
      required: false,
      max_select: null,
    });
    setName("");
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        placeholder="Nome do novo grupo (ex: Molho)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 min-w-[160px] bg-surface border border-dashed border-border rounded-lg px-3 py-2 text-sm"
      />
      <button
        onClick={handleAdd}
        disabled={saving}
        className="bg-accent text-accent-ink font-semibold text-sm px-3 py-2 rounded-lg disabled:opacity-60 flex items-center gap-1.5"
      >
        <Plus size={14} /> Grupo
      </button>
    </div>
  );
}

export function ProductOptionsEditor({ product }: { product: Product }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 mt-1 mb-2 flex flex-col gap-3">
      <p className="text-muted text-xs">
        Grupos de opção pra <strong className="text-heading">{product.name}</strong>. Ex: Massa
        (escolha única), Acompanhamentos (múltipla escolha, até 4).
      </p>
      {product.product_option_groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
      <NewGroupForm productId={product.id} />
    </div>
  );
}
