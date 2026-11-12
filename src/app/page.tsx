import { MenuPage } from "@/components/menu-page";
import { getMenu, getStoreSettings } from "@/lib/queries";

export const revalidate = 0;

export default async function Home() {
  const [settings, categories] = await Promise.all([getStoreSettings(), getMenu()]);

  return <MenuPage settings={settings} categories={categories} />;
}
