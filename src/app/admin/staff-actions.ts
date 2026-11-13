"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StaffRole } from "@/lib/types";

async function assertIsOwnerAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.user_metadata as { role?: string } | undefined)?.role;
  if (!user || role === "garcom") {
    throw new Error("Sem permissão para gerenciar acessos da equipe.");
  }
  return user;
}

export type StaffAccount = { id: string; email: string; role: StaffRole; created_at: string };

export async function listStaffAccounts(): Promise<StaffAccount[]> {
  await assertIsOwnerAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw new Error(error.message);
  return data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    role: (u.user_metadata as { role?: string } | undefined)?.role === "garcom" ? "garcom" : "admin",
    created_at: u.created_at,
  }));
}

export async function createStaffAccount(email: string, password: string, role: StaffRole) {
  await assertIsOwnerAdmin();
  if (!email.trim() || password.length < 6) {
    throw new Error("E-mail válido e senha com pelo menos 6 caracteres.");
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: { role },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/configuracoes");
}

export async function deleteStaffAccount(userId: string) {
  const currentUser = await assertIsOwnerAdmin();
  if (userId === currentUser.id) {
    throw new Error("Você não pode remover o próprio login enquanto está usando ele.");
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/configuracoes");
}
