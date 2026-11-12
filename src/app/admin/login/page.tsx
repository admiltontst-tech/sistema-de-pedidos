import Image from "next/image";
import { getStoreSettings } from "@/lib/queries";
import { AdminLoginForm } from "@/components/admin-login-form";

export const revalidate = 0;

export default async function AdminLoginPage() {
  const settings = await getStoreSettings();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-chip-border bg-chip">
            {settings.logo_url && (
              <Image
                src={settings.logo_url}
                alt={settings.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <div>
            <h1 className="font-display text-lg text-heading leading-tight">Painel administrativo</h1>
            <p className="text-muted text-sm">{settings.name}</p>
          </div>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
