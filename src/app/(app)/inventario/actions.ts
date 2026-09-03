"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateAll() {
  for (const path of ["/inventario", "/sugestoes", "/plano", "/compras"]) {
    revalidatePath(path);
  }
}

export type ItemInput = {
  name: string;
  zone: string;
  amount: number;
  unit: string | null;
  expiry: string | null;
  alert_days: number | null;
  min_stock: number | null;
  ignore_low_stock: boolean;
};

export async function createItem(input: ItemInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sem sessão.");

  const { error } = await supabase.from("items").insert({ ...input, user_id: user.id });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function updateItem(id: string, input: ItemInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function updateItemAmount(id: string, amount: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").update({ amount }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function createZone(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sem sessão.");

  const { error } = await supabase.from("zones").insert({ name, user_id: user.id });
  if (error) throw new Error(error.message);
  revalidateAll();
}
