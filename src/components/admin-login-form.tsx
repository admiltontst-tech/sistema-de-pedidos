"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <form onSubmit={handleSubmit} className="flex flex-col">
      <label className="text-[12.5px] font-bold text-muted uppercase block mb-4">
        E-mail
        <div className="relative mt-1.5">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
          />
        </div>
      </label>
      <label className="text-[12.5px] font-bold text-muted uppercase block mb-6">
        Senha
        <div className="relative mt-1.5">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </label>

      {error && <p className="text-[#B91C1C] text-sm mb-4">{error}</p>}

      <button
        disabled={loading}
        className="w-full bg-accent text-accent-ink font-bold py-3.5 rounded-xl disabled:opacity-60 hover:brightness-95 active:scale-[0.99] transition flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
