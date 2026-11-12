import { getStoreSettings } from "@/lib/queries";
import { SettingsForm } from "@/components/settings-form";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="font-display text-xl text-heading mb-5">Configurações da loja</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
