"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeName } from "@/lib/ingredientMatch";

function revalidateAll() {
  for (const path of ["/compras", "/inventario", "/sugestoes", "/plano"]) {
    revalidatePath(path);
  }
}

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sem sessão.");
  return user.id;
}

/** Soma a quantidade comprada a um item existente do inventário. */
export async function buyExistingItem(itemId: string, qtyPurchased: number) {
  const supabase = await createClient();
  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("amount")
    .eq("id", itemId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("items")
    .update({ amount: Number(item.amount) + qtyPurchased })
    .eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function ignoreLowStock(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").update({ ignore_low_stock: true }).eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidateAll();
}

/**
 * Regista a compra de um ingrediente/item por nome: se já existir um item
 * com esse nome soma-lhe a quantidade, caso contrário cria um item novo na
 * zona indicada.
 */
export async function recordPurchaseByName(name: string, qtyPurchased: number, zone: string | null) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  const { data: items, error: fetchError } = await supabase.from("items").select("id, name, amount");
  if (fetchError) throw new Error(fetchError.message);

  const existing = (items ?? []).find((i) => normalizeName(i.name) === normalizeName(name));

  if (existing) {
    const { error } = await supabase
      .from("items")
      .update({ amount: Number(existing.amount) + qtyPurchased })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    if (!zone) throw new Error("Escolhe a zona onde vais guardar este item.");
    const { error } = await supabase
      .from("items")
      .insert({ user_id: userId, name, zone, amount: qtyPurchased });
    if (error) throw new Error(error.message);
  }
  revalidateAll();
}

export async function setIngredientChecked(ingredientName: string, checked: boolean) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  const { error } = await supabase
    .from("shopping_checked_ingredients")
    .upsert(
      { user_id: userId, ingredient_name: ingredientName, checked },
      { onConflict: "ingredient_name" },
    );
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function addManualItem(name: string) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  const { error } = await supabase.from("shopping_manual_items").insert({ user_id: userId, name });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function setManualItemChecked(id: string, checked: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("shopping_manual_items").update({ checked }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function removeManualItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("shopping_manual_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function clearPurchased() {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  const [a, b] = await Promise.all([
    supabase.from("shopping_manual_items").delete().eq("user_id", userId).eq("checked", true),
    supabase.from("shopping_checked_ingredients").delete().eq("user_id", userId).eq("checked", true),
  ]);
  if (a.error) throw new Error(a.error.message);
  if (b.error) throw new Error(b.error.message);
  revalidateAll();
}
