import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a service_role key: ignora RLS. Uso restrito a código de
 * servidor confiável (nunca importar a partir de um arquivo "use client"):
 * a página pública de acompanhamento de pedido (busca por id específico)
 * e rotinas administrativas pontuais.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
