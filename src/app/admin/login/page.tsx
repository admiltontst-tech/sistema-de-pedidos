import Image from "next/image";
import { getStoreSettings } from "@/lib/queries";
import { AdminLoginForm } from "@/components/admin-login-form";

export const revalidate = 0;

export default async function AdminLoginPage() {
  const settings = await getStoreSettings();
  const nameParts = settings.name.split(" ");
  const nameStart = nameParts.slice(0, -2).join(" ");
  const nameEnd = nameParts.slice(-2).join(" ");

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-5 py-12"
      style={{ background: "linear-gradient(180deg, #FDF4EC 0%, #FBE3C9 100%)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-2 bg-accent" />

      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-[88px] h-[88px] rounded-full overflow-hidden border-[3px] border-accent shadow-[0_10px_30px_rgba(232,89,12,0.25)] flex-shrink-0 bg-chip mb-5">
          {settings.logo_url && (
            <Image
              src={settings.logo_url}
              alt={settings.name}
              width={88}
              height={88}
              className="object-cover w-full h-full"
            />
          )}
        </div>

        <h1 className="font-display font-bold text-heading text-2xl text-center leading-tight">
          {nameStart} <span className="text-accent">{nameEnd}</span>
        </h1>
        <p className="text-muted text-[11px] font-bold uppercase tracking-[0.12em] mt-1.5 mb-8">
          Painel administrativo
        </p>

        <div className="bg-surface border border-border rounded-2xl p-7 w-full shadow-[0_20px_45px_rgba(43,27,18,0.08)]">
          <AdminLoginForm />
        </div>

        {settings.tagline && (
          <p className="text-muted text-xs mt-7 text-center">{settings.tagline}</p>
        )}
      </div>
    </div>
  );
}
