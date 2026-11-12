import Image from "next/image";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNavLinks } from "@/components/admin-nav-links";
import { getStoreSettings } from "@/lib/queries";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const settings = await getStoreSettings();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border-soft bg-surface">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
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
            <div>
              <div className="font-display font-bold text-heading text-sm leading-tight">
                {settings.name}
              </div>
              <div className="text-muted text-[11px] font-medium leading-tight">Painel administrativo</div>
            </div>
          </div>
          <AdminNavLinks />
          <AdminLogoutButton />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-5 py-8">{children}</div>
    </div>
  );
}
