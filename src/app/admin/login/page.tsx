"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("E-mail ou senha incorretos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-2xl p-8 w-full max-w-sm"
      >
        <h1 className="font-display text-xl text-heading mb-1">Painel administrativo</h1>
        <p className="text-muted text-sm mb-6">Espetinho do Beh</p>

        <label className="text-[12.5px] font-bold text-muted uppercase block mb-3.5">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
          />
        </label>
        <label className="text-[12.5px] font-bold text-muted uppercase block mb-5">
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1.5 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
          />
        </label>

        {error && <p className="text-[#B91C1C] text-sm mb-4">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-accent text-accent-ink font-bold py-3 rounded-lg disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
