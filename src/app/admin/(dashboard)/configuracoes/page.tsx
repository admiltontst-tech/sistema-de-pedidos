import { getStoreSettings } from "@/lib/queries";
import { SettingsForm } from "@/components/settings-form";
import { StaffAccessPanel } from "@/components/staff-access-panel";
import { listStaffAccounts } from "@/app/admin/staff-actions";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const [settings, staffAccounts] = await Promise.all([getStoreSettings(), listStaffAccounts()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-xl text-heading mb-5">Configurações da loja</h1>
        <SettingsForm settings={settings} />
      </div>
      <StaffAccessPanel initialAccounts={staffAccounts} />
    </div>
  );
}
