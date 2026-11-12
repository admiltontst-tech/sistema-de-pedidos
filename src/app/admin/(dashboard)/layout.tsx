import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin-logout-button";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border-soft bg-surface">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-display font-bold text-heading">Admin</span>
            <nav className="flex gap-5 text-sm font-semibold text-muted">
              <Link href="/admin" className="hover:text-foreground">
                Pedidos
              </Link>
              <Link href="/admin/produtos" className="hover:text-foreground">
                Cardápio
              </Link>
              <Link href="/admin/configuracoes" className="hover:text-foreground">
                Configurações
              </Link>
            </nav>
          </div>
          <AdminLogoutButton />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-5 py-8">{children}</div>
    </div>
  );
}
