"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { listStaffAccounts, createStaffAccount, deleteStaffAccount } from "@/app/admin/staff-actions";
import type { StaffAccount } from "@/app/admin/staff-actions";
import type { StaffRole } from "@/lib/types";

const ROLE_LABEL: Record<StaffRole, string> = { admin: "Administrador", garcom: "Garçom" };

export function StaffAccessPanel({
  initialAccounts,
  currentUserId,
}: {
  initialAccounts: StaffAccount[];
  currentUserId: string;
}) {
  const [accounts, setAccounts] = useState<StaffAccount[]>(initialAccounts);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("garcom");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await listStaffAccounts();
    setAccounts(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createStaffAccount(email, password, role);
      setEmail("");
      setPassword("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar acesso.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esse acesso?")) return;
    try {
      await deleteStaffAccount(id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao remover acesso.");
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg flex flex-col gap-4">
      <div>
        <h2 className="font-display font-bold text-heading text-base">Acesso da equipe</h2>
        <p className="text-muted text-sm mt-1">
          Crie logins separados pra cada pessoa que usa o painel. <strong className="text-heading">Administrador</strong>{" "}
          tem acesso total (igual o login principal). <strong className="text-heading">Garçom</strong> só
          enxerga a tela de Mesas, sem ver configurações, cardápio ou dados de clientes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          {(["garcom", "admin"] as StaffRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 text-sm font-semibold px-3 py-2.5 rounded-lg border-[1.5px] ${
                role === r
                  ? "border-accent bg-accent/10 text-accent-dark"
                  : "border-border text-foreground/80"
              }`}
            >
              {ROLE_LABEL[r]}
            </button>
          ))}
        </div>
        <label className="text-[12.5px] font-bold text-muted uppercase">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
          />
        </label>
        <label className="text-[12.5px] font-bold text-muted uppercase">
          Senha (mín. 6 caracteres)
          <input
            type="text"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
          />
        </label>
        {error && <p className="text-[#B91C1C] text-sm">{error}</p>}
        <button
          disabled={saving}
          className="bg-accent text-accent-ink font-bold py-2.5 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Criar acesso de {ROLE_LABEL[role].toLowerCase()}
        </button>
      </form>

      <div className="border-t border-border-soft pt-3.5 flex flex-col gap-2">
        {accounts.length === 0 ? (
          <p className="text-muted text-sm">Nenhum acesso criado ainda.</p>
        ) : (
          accounts.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between bg-chip rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">{acc.email}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface text-muted flex-shrink-0">
                  {ROLE_LABEL[acc.role]}
                </span>
                {acc.id === currentUserId && (
                  <span className="text-[11px] font-bold text-accent-dark flex-shrink-0">(você)</span>
                )}
              </div>
              {acc.id !== currentUserId && (
                <button
                  onClick={() => handleDelete(acc.id)}
                  aria-label={`Remover acesso de ${acc.email}`}
                  className="text-[#B91C1C] flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
