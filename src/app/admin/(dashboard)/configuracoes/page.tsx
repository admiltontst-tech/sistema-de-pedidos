import { getStoreSettings } from "@/lib/queries";
import { SettingsForm } from "@/components/settings-form";
import { StaffAccessPanel } from "@/components/staff-access-panel";
import { listStaffAccounts } from "@/app/admin/staff-actions";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [settings, staffAccounts, { data: userData }] = await Promise.all([
    getStoreSettings(),
    listStaffAccounts(),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-xl text-heading mb-5">Configurações da loja</h1>
        <SettingsForm settings={settings} />
      </div>
      <StaffAccessPanel initialAccounts={staffAccounts} currentUserId={userData.user?.id ?? ""} />
    </div>
  );
}
