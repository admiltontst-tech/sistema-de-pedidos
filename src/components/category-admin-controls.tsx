"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { createCategory, renameCategory, deleteCategory } from "@/app/admin/actions";

export function NewCategoryForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createCategory(name.trim());
      setName("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar categoria.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-accent text-accent-ink font-bold text-sm px-4 py-2.5 rounded-lg hover:brightness-95 transition"
      >
        + Nova categoria
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center">
      <input
        autoFocus
        placeholder="Nome da categoria (ex: Sobremesas)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm min-w-[220px]"
      />
      <button
        disabled={saving}
        className="bg-accent text-accent-ink font-bold text-sm px-4 py-2 rounded-lg disabled:opacity-60"
      >
        {saving ? "Criando..." : "Criar"}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setError(null);
        }}
        className="text-muted text-sm"
      >
        Cancelar
      </button>
      {error && <p className="text-[#B91C1C] text-xs w-full">{error}</p>}
    </form>
  );
}

export function CategoryHeader({ id, name }: { id: string; name: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!value.trim() || value === name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await renameCategory(id, value.trim());
    setSaving(false);
    setEditing(false);
  }

  async function handleDelete() {
    setError(null);
    if (!confirm(`Excluir a categoria "${name}"?`)) return;
    try {
      await deleteCategory(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir categoria.");
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          disabled={saving}
          className="font-display font-bold text-heading text-base bg-surface border border-border rounded-lg px-2 py-1"
        />
        <button
          onClick={save}
          aria-label="Salvar nome"
          className="w-7 h-7 rounded-full bg-[#1F9D55]/10 text-[#15803D] flex items-center justify-center"
        >
          <Check size={14} />
        </button>
        <button
          onClick={() => setEditing(false)}
          aria-label="Cancelar"
          className="w-7 h-7 rounded-full bg-chip text-muted flex items-center justify-center"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group">
      <h2 className="font-display font-bold text-heading text-base">{name}</h2>
      <button
        onClick={() => setEditing(true)}
        aria-label={`Renomear ${name}`}
        className="opacity-0 group-hover:opacity-100 text-muted hover:text-accent-dark transition"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={handleDelete}
        aria-label={`Excluir ${name}`}
        className="opacity-0 group-hover:opacity-100 text-muted hover:text-[#B91C1C] transition"
      >
        <Trash2 size={13} />
      </button>
      {error && <p className="text-[#B91C1C] text-xs ml-2">{error}</p>}
    </div>
  );
}
