import { getOpenTabs, getStoreSettings } from "@/lib/queries";
import { MesasGrid } from "@/components/mesas-grid";

export const revalidate = 0;

export default async function AdminMesasPage() {
  const [openTabs, settings] = await Promise.all([getOpenTabs(), getStoreSettings()]);

  return (
    <div>
      <h1 className="font-display text-xl text-heading mb-1">Mesas e comandas</h1>
      <p className="text-muted text-sm mb-6">
        Toque numa mesa pra abrir ou continuar o pedido dela. O número de mesas pode ser ajustado
        em Configurações.
      </p>
      <MesasGrid tableCount={settings.table_count} openTabs={openTabs} />
    </div>
  );
}
