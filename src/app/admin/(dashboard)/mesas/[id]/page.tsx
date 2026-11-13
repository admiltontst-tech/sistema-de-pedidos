import { notFound } from "next/navigation";
import { getTabWithOrders, getMenu } from "@/lib/queries";
import { TabDetail } from "@/components/tab-detail";

export const revalidate = 0;

export default async function TabDetailPage(props: PageProps<"/admin/mesas/[id]">) {
  const { id } = await props.params;
  const [result, categories] = await Promise.all([getTabWithOrders(id), getMenu()]);

  if (!result) {
    notFound();
  }

  const nonEmptyCategories = categories.filter((c) => c.products.length > 0);
  return <TabDetail tab={result.tab} orders={result.orders} categories={nonEmptyCategories} />;
}
