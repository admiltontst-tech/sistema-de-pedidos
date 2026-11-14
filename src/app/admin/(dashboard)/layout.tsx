import Image from "next/image";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNavLinks } from "@/components/admin-nav-links";
import { getStoreSettings } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  // getSession() lê a sessão já validada pelo middleware (sem nova chamada de
  // rede pro Supabase Auth) — aqui o papel do usuário só decide o que aparece
  // no cabeçalho, a checagem de segurança de verdade já aconteceu no middleware.
  const [settings, { data: { session } }] = await Promise.all([
    getStoreSettings(),
    supabase.auth.getSession(),
  ]);
  const role =
    (session?.user.user_metadata as { role?: string } | undefined)?.role === "garcom"
      ? "garcom"
      : "admin";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border-soft bg-surface">
        <div className="max-w-5xl mx-auto px-5 pt-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-chip-border bg-chip">
              {settings.logo_url && (
                <Image
                  src={settings.logo_url}
                  alt={settings.name}
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-heading text-sm leading-tight truncate">
                {settings.name}
              </div>
              <div className="text-muted text-[11px] font-medium leading-tight truncate">
                {role === "garcom" ? "Painel do garçom" : "Painel administrativo"}
              </div>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
        <div className="max-w-5xl mx-auto px-5 pb-2.5 pt-2">
          <AdminNavLinks role={role} />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-5 py-8">{children}</div>
    </div>
  );
}
