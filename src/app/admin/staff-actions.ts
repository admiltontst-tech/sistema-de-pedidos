"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertIsOwnerAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata as { role?: string } | undefined)?.role;
  if (!user || role === "garcom") {
    throw new Error("Sem permissão para gerenciar acessos da equipe.");
  }
}

export type StaffAccount = { id: string; email: string; created_at: string };

export async function listStaffAccounts(): Promise<StaffAccount[]> {
  await assertIsOwnerAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw new Error(error.message);
  return data.users
    .filter((u) => (u.user_metadata as { role?: string } | undefined)?.role === "garcom")
    .map((u) => ({ id: u.id, email: u.email ?? "", created_at: u.created_at }));
}

export async function createStaffAccount(email: string, password: string) {
  await assertIsOwnerAdmin();
  if (!email.trim() || password.length < 6) {
    throw new Error("E-mail válido e senha com pelo menos 6 caracteres.");
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: { role: "garcom" },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/configuracoes");
}

export async function deleteStaffAccount(userId: string) {
  await assertIsOwnerAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/configuracoes");
}
