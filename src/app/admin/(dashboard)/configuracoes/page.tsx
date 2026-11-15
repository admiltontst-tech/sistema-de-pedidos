import { getStoreSettings } from "@/lib/queries";
import { SettingsForm } from "@/components/settings-form";
import { StoreOpenToggle } from "@/components/store-open-toggle";
import { StaffAccessPanel } from "@/components/staff-access-panel";
import { PushNotificationsCard } from "@/components/push-notifications-card";
import { listStaffAccounts } from "@/app/admin/staff-actions";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  // getSession() lê a sessão já validada pelo middleware, sem nova chamada de
  // rede — aqui só precisamos do id pra destacar "(você)" na lista, a
  // segurança de verdade é checada dentro das próprias ações do servidor.
  const [settings, staffAccounts, { data: { session } }] = await Promise.all([
    getStoreSettings(),
    listStaffAccounts(),
    supabase.auth.getSession(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-xl text-heading mb-5">Configurações da loja</h1>
        <StoreOpenToggle initialIsOpen={settings.is_open} />
        <div className="mt-4">
          <SettingsForm settings={settings} />
        </div>
      </div>
      <PushNotificationsCard />
      <StaffAccessPanel initialAccounts={staffAccounts} currentUserId={session?.user.id ?? ""} />
    </div>
  );
}
