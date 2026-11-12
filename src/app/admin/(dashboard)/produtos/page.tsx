import { getMenuForAdmin } from "@/lib/queries";
import { ProductsAdmin } from "@/components/products-admin";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const categories = await getMenuForAdmin();

  return (
    <div>
      <h1 className="font-display text-xl text-heading mb-1">Cardápio</h1>
      <p className="text-muted text-sm mb-5">
        Edite preço e disponibilidade. Opções do &quot;Monte seu Macarrão&quot; e novas categorias
        podem ser ajustadas direto no Supabase (Table Editor) por enquanto.
      </p>
      <ProductsAdmin categories={categories} />
    </div>
  );
}
